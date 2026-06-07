"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma";
import { publishEventUpdate } from "@/lib/realtime/ably-server";
import { dashboardChannel, eventChannel, inviteChannel } from "@/lib/realtime/events";
import {
  maxInfoBlocksPerEvent,
  parseInfoBlockFormData,
} from "@/lib/validations/info-block";

async function requireOwnedEvent(eventId: string) {
  await auth.protect();

  const currentUser = await getCurrentUser();

  if (currentUser.status !== "ready" || !currentUser.dbUser) {
    throw new Error("Local user is not available.");
  }

  const event = await prisma.event.findFirst({
    where: { id: eventId, hostId: currentUser.dbUser.id },
    select: { id: true, slug: true, hostId: true },
  });

  if (!event) {
    redirect("/dashboard");
  }

  return event;
}

function redirectWithError(eventId: string, message: string): never {
  redirect(`/dashboard/events/${eventId}/info-blocks?error=${encodeURIComponent(message)}`);
}

function revalidateInfoSurfaces(eventId: string, slug: string) {
  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath(`/dashboard/events/${eventId}/info-blocks`);
  revalidatePath(`/invite/${slug}`);
  revalidatePath("/dashboard");
}

async function publishInfoChange({
  eventId,
  slug,
  hostId,
  type,
}: {
  eventId: string;
  slug: string;
  hostId: string;
  type: "INFO_BLOCK_CREATED" | "INFO_BLOCK_UPDATED" | "INFO_BLOCK_DELETED";
}) {
  await publishEventUpdate(
    [eventChannel(eventId), inviteChannel(slug), dashboardChannel(hostId)],
    { type, eventId, slug, message: "Event info was updated" },
  );
}

export async function createInfoBlockAction(formData: FormData) {
  const parsed = parseInfoBlockFormData(formData);
  const eventId = String(formData.get("eventId") || "");

  if (!parsed.success) {
    redirectWithError(eventId, parsed.error.issues[0]?.message || "Check the info block.");
  }

  const event = await requireOwnedEvent(parsed.data.eventId);
  const count = await prisma.eventInfoBlock.count({ where: { eventId: event.id } });

  if (count >= maxInfoBlocksPerEvent) {
    redirectWithError(event.id, "Use at most 8 info blocks per event.");
  }

  await prisma.eventInfoBlock.create({ data: parsed.data });
  await prisma.eventActivity.create({
    data: {
      eventId: event.id,
      type: "INFO_BLOCK_CREATED",
      message: "Event info was updated",
    },
  });

  revalidateInfoSurfaces(event.id, event.slug);
  await publishInfoChange({
    eventId: event.id,
    slug: event.slug,
    hostId: event.hostId,
    type: "INFO_BLOCK_CREATED",
  });
}

export async function deleteInfoBlockAction(formData: FormData) {
  const blockId = String(formData.get("blockId") || "");
  await auth.protect();

  const currentUser = await getCurrentUser();

  if (currentUser.status !== "ready" || !currentUser.dbUser) {
    throw new Error("Local user is not available.");
  }

  const block = await prisma.eventInfoBlock.findFirst({
    where: { id: blockId, event: { hostId: currentUser.dbUser.id } },
    include: { event: { select: { id: true, slug: true, hostId: true } } },
  });

  if (!block) {
    redirect("/dashboard");
  }

  await prisma.eventInfoBlock.delete({ where: { id: block.id } });
  await prisma.eventActivity.create({
    data: {
      eventId: block.eventId,
      type: "INFO_BLOCK_DELETED",
      message: "Event info was updated",
    },
  });

  revalidateInfoSurfaces(block.eventId, block.event.slug);
  await publishInfoChange({
    eventId: block.eventId,
    slug: block.event.slug,
    hostId: block.event.hostId,
    type: "INFO_BLOCK_DELETED",
  });
}

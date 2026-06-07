"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma";
import { publishEventUpdate } from "@/lib/realtime/ably-server";
import { dashboardChannel, eventChannel, inviteChannel } from "@/lib/realtime/events";
import {
  maxBroadcastsPerEvent,
  parseBroadcastFormData,
} from "@/lib/validations/broadcast";

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
  redirect(`/dashboard/events/${eventId}/broadcasts?error=${encodeURIComponent(message)}`);
}

function revalidateBroadcastSurfaces(eventId: string, slug: string) {
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath(`/dashboard/events/${eventId}/broadcasts`);
  revalidatePath(`/invite/${slug}`);
}

async function publishBroadcastChange({
  eventId,
  slug,
  hostId,
  type,
  message,
}: {
  eventId: string;
  slug: string;
  hostId: string;
  type: "BROADCAST_CREATED" | "BROADCAST_DELETED" | "BROADCAST_UPDATED" | "BROADCAST_PINNED";
  message: string;
}) {
  await publishEventUpdate(
    [eventChannel(eventId), inviteChannel(slug), dashboardChannel(hostId)],
    { type, eventId, slug, message },
  );
}

export async function createBroadcastAction(formData: FormData) {
  const parsed = parseBroadcastFormData(formData);
  const eventId = String(formData.get("eventId") || "");

  if (!parsed.success) {
    redirectWithError(eventId, parsed.error.issues[0]?.message || "Check the update details.");
  }

  const event = await requireOwnedEvent(parsed.data.eventId);
  const count = await prisma.eventBroadcast.count({ where: { eventId: event.id } });

  if (count >= maxBroadcastsPerEvent) {
    redirectWithError(event.id, "Use at most 30 broadcasts per event.");
  }

  await prisma.eventBroadcast.create({ data: parsed.data });
  const message = parsed.data.pinned ? "A pinned update was posted" : "Host posted an update";

  await prisma.eventActivity.create({
    data: {
      eventId: event.id,
      type: "BROADCAST_CREATED",
      message,
    },
  });

  revalidateBroadcastSurfaces(event.id, event.slug);
  await publishBroadcastChange({
    eventId: event.id,
    slug: event.slug,
    hostId: event.hostId,
    type: "BROADCAST_CREATED",
    message,
  });
  redirect(`/dashboard/events/${event.id}/broadcasts`);
}

export async function deleteBroadcastAction(formData: FormData) {
  const broadcastId = String(formData.get("broadcastId") || "");
  await auth.protect();

  const currentUser = await getCurrentUser();

  if (currentUser.status !== "ready" || !currentUser.dbUser) {
    throw new Error("Local user is not available.");
  }

  const broadcast = await prisma.eventBroadcast.findFirst({
    where: { id: broadcastId, event: { hostId: currentUser.dbUser.id } },
    include: { event: { select: { id: true, slug: true, hostId: true } } },
  });

  if (!broadcast) {
    redirect("/dashboard");
  }

  await prisma.eventBroadcast.delete({ where: { id: broadcast.id } });
  await prisma.eventActivity.create({
    data: {
      eventId: broadcast.eventId,
      type: "BROADCAST_DELETED",
      message: "An update was removed",
    },
  });

  revalidateBroadcastSurfaces(broadcast.eventId, broadcast.event.slug);
  await publishBroadcastChange({
    eventId: broadcast.eventId,
    slug: broadcast.event.slug,
    hostId: broadcast.event.hostId,
    type: "BROADCAST_DELETED",
    message: "An update was removed",
  });
}

export async function toggleBroadcastPinnedAction(formData: FormData) {
  const broadcastId = String(formData.get("broadcastId") || "");
  await auth.protect();

  const currentUser = await getCurrentUser();

  if (currentUser.status !== "ready" || !currentUser.dbUser) {
    throw new Error("Local user is not available.");
  }

  const broadcast = await prisma.eventBroadcast.findFirst({
    where: { id: broadcastId, event: { hostId: currentUser.dbUser.id } },
    include: { event: { select: { id: true, slug: true, hostId: true } } },
  });

  if (!broadcast) {
    redirect("/dashboard");
  }

  const updated = await prisma.eventBroadcast.update({
    where: { id: broadcast.id },
    data: { pinned: !broadcast.pinned },
  });
  const message = updated.pinned ? "An update was pinned" : "An update was unpinned";

  await prisma.eventActivity.create({
    data: {
      eventId: broadcast.eventId,
      type: updated.pinned ? "BROADCAST_PINNED" : "BROADCAST_UPDATED",
      message,
    },
  });

  revalidateBroadcastSurfaces(broadcast.eventId, broadcast.event.slug);
  await publishBroadcastChange({
    eventId: broadcast.eventId,
    slug: broadcast.event.slug,
    hostId: broadcast.event.hostId,
    type: updated.pinned ? "BROADCAST_PINNED" : "BROADCAST_UPDATED",
    message,
  });
}

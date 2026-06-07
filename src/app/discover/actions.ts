"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { isClerkConfigured, isDatabaseConfigured } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { publishEventUpdate } from "@/lib/realtime/ably-server";
import { dashboardChannel, eventChannel, inviteChannel } from "@/lib/realtime/events";
import { parseInterestFormData } from "@/lib/validations/discover";

type ToggleInterestResult =
  | { ok: true; interested: boolean; count: number }
  | { ok: false; error: string };

export async function toggleInterestAction(formData: FormData): Promise<ToggleInterestResult> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: "Database is not configured yet." };
  }

  const parsed = parseInterestFormData(formData);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Check interest details." };
  }

  const input = parsed.data;
  const event = await prisma.event.findFirst({
    where: { id: input.eventId, visibility: "public" },
    select: { id: true, slug: true, title: true, hostId: true },
  });

  if (!event) {
    return { ok: false, error: "This public event is not available." };
  }

  let userId: string | null = null;
  let name = input.name;

  if (isClerkConfigured()) {
    const currentUser = await getCurrentUser();

    if (currentUser.status === "ready" && currentUser.dbUser) {
      userId = currentUser.dbUser.id;
      name = currentUser.dbUser.name || input.name;
    }
  }

  if (!userId && !input.guestId) {
    return { ok: false, error: "Guest interest needs a browser guest id." };
  }

  const where = userId
    ? { eventId: event.id, userId }
    : { eventId: event.id, guestId: input.guestId };

  const existing = await prisma.eventInterest.findFirst({ where, select: { id: true } });
  const interested = !existing;

  if (existing) {
    await prisma.eventInterest.delete({ where: { id: existing.id } });
  } else {
    await prisma.eventInterest.create({
      data: {
        eventId: event.id,
        userId,
        guestId: userId ? undefined : input.guestId,
        name,
      },
    });
  }

  await prisma.eventActivity.create({
    data: {
      eventId: event.id,
      type: interested ? "INTERESTED_CREATED" : "INTERESTED_REMOVED",
      message: interested
        ? `${name || "Someone"} is interested`
        : `${name || "Someone"} removed interest`,
    },
  });

  const count = await prisma.eventInterest.count({ where: { eventId: event.id } });

  revalidatePath("/discover");
  revalidatePath("/");
  revalidatePath(`/invite/${event.slug}`);

  await publishEventUpdate(
    [eventChannel(event.id), inviteChannel(event.slug), dashboardChannel(event.hostId)],
    {
      type: interested ? "INTEREST_CREATED" : "INTEREST_REMOVED",
      eventId: event.id,
      slug: event.slug,
      message: interested ? "Someone is interested" : "Interest removed",
    },
  );

  return { ok: true, interested, count };
}

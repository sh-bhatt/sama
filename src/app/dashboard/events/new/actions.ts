"use server";

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma";
import { publishEventUpdate } from "@/lib/realtime/ably-server";
import { dashboardChannel, eventChannel, inviteChannel } from "@/lib/realtime/events";
import { generateUniqueEventSlug } from "@/lib/slug";
import { eventDateStringToDate, parseEventFormData } from "@/lib/validations/event";

function redirectWithError(message: string): never {
  redirect(`/dashboard/events/new?error=${encodeURIComponent(message)}`);
}

export async function createEventAction(formData: FormData) {
  await auth.protect();

  const currentUser = await getCurrentUser();

  if (currentUser.status === "database-not-configured") {
    redirectWithError("Database is not configured yet.");
  }

  if (currentUser.status !== "ready" || !currentUser.dbUser) {
    redirectWithError("Could not prepare your host profile.");
  }

  const parsed = parseEventFormData(formData);

  if (!parsed.success) {
    redirectWithError(parsed.error.issues[0]?.message || "Check the event details.");
  }

  const input = parsed.data;
  const slug = await generateUniqueEventSlug(input.title);
  const event = await prisma.event.create({
    data: {
      hostId: currentUser.dbUser.id,
      title: input.title,
      slug,
      description: input.description,
      eventDate: eventDateStringToDate(input.eventDate),
      eventTime: input.eventTime,
      location: input.location,
      visibility: input.visibility,
      theme: input.theme || "Mehfil",
      category: input.category,
      city: input.city,
      capacity: input.capacity,
      allowPlusOne: input.allowPlusOne,
      requiresApproval: input.requiresApproval,
      waitlistEnabled: input.waitlistEnabled,
      upiId: input.upiId,
      paymentNote: input.paymentNote,
    },
  });
  await publishEventUpdate(
    [eventChannel(event.id), inviteChannel(event.slug), dashboardChannel(event.hostId)],
    {
      type: "EVENT_UPDATED",
      eventId: event.id,
      slug: event.slug,
      message: "Event created",
    },
  );

  redirect(`/dashboard/events/${event.id}`);
}

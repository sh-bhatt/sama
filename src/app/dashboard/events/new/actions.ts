"use server";

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { parseCardDesignFormData } from "@/lib/card-design";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { uploadEventCoverImage } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { publishEventUpdate } from "@/lib/realtime/ably-server";
import { dashboardChannel, eventChannel, inviteChannel } from "@/lib/realtime/events";
import { generateUniqueEventSlug } from "@/lib/slug";
import { eventDateStringToDate, parseEventFormData } from "@/lib/validations/event";
import { addEventDuration, eventDateTimeToDate } from "@/lib/event-lifecycle";

function redirectWithError(message: string): never {
  redirect(`/dashboard/events/new?error=${encodeURIComponent(message)}`);
}

const allowedCoverImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxCoverImageSize = 5 * 1024 * 1024;

function getCoverImageFile(formData: FormData) {
  const value = formData.get("coverImage");

  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  if (!allowedCoverImageTypes.has(value.type)) {
    redirectWithError("Use a JPG, PNG, or WebP cover image.");
  }

  if (value.size > maxCoverImageSize) {
    redirectWithError("Cover image must be 5MB or smaller.");
  }

  return value;
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
  const cardDesign = parseCardDesignFormData(formData);
  const eventDate = eventDateStringToDate(input.eventDate);
  const startsAt = eventDateTimeToDate(eventDate, input.eventTime);
  const endsAt = addEventDuration(startsAt, input.durationHours);
  const coverImageFile = getCoverImageFile(formData);
  let coverImage: string | null = null;

  if (coverImageFile) {
    try {
      const buffer = Buffer.from(await coverImageFile.arrayBuffer());
      const uploaded = await uploadEventCoverImage({
        buffer,
        eventId: slug,
      });

      coverImage = uploaded.secure_url;
    } catch (error) {
      console.warn("Event cover upload failed:", error);
      redirectWithError("Could not upload the event cover image. Check Cloudinary setup and try again.");
    }
  }

  const event = await prisma.event.create({
    data: {
      hostId: currentUser.dbUser.id,
      title: input.title,
      slug,
      description: input.description,
      eventDate,
      eventTime: input.eventTime,
      startsAt,
      endsAt,
      location: input.location,
      visibility: input.visibility,
      theme: input.theme,
      category: input.category,
      city: input.city,
      coverImage,
      cardDesign,
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

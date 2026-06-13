"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { parseCardDesignFormData } from "@/lib/card-design";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { uploadEventCoverImage } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { publishEventUpdate } from "@/lib/realtime/ably-server";
import { dashboardChannel, eventChannel, inviteChannel } from "@/lib/realtime/events";

const allowedCoverImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxCoverImageSize = 5 * 1024 * 1024;

function redirectWithError(eventId: string, message: string): never {
  redirect(`/dashboard/events/${eventId}/design?error=${encodeURIComponent(message)}`);
}

function getCoverImageFile(eventId: string, formData: FormData) {
  const value = formData.get("coverImage");

  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  if (!allowedCoverImageTypes.has(value.type)) {
    redirectWithError(eventId, "Use a JPG, PNG, or WebP cover image.");
  }

  if (value.size > maxCoverImageSize) {
    redirectWithError(eventId, "Cover image must be 5MB or smaller.");
  }

  return value;
}

export async function updateEventDesignAction(eventId: string, formData: FormData) {
  await auth.protect();

  const currentUser = await getCurrentUser();

  if (currentUser.status !== "ready" || !currentUser.dbUser) {
    redirect("/dashboard");
  }

  const event = await prisma.event.findFirst({
    where: { id: eventId, hostId: currentUser.dbUser.id },
    select: { id: true, slug: true, hostId: true },
  });

  if (!event) {
    redirect("/dashboard");
  }

  const cardDesign = parseCardDesignFormData(formData);
  const coverImageFile = getCoverImageFile(eventId, formData);
  let coverImage: string | undefined;

  if (coverImageFile) {
    try {
      const buffer = Buffer.from(await coverImageFile.arrayBuffer());
      const uploaded = await uploadEventCoverImage({ buffer, eventId: event.id });
      coverImage = uploaded.secure_url;
    } catch (error) {
      console.warn("Event design cover upload failed:", error);
      redirectWithError(event.id, "Could not upload the cover image. Check Cloudinary setup and try again.");
    }
  }

  await prisma.event.update({
    where: { id: event.id },
    data: {
      cardDesign,
      ...(coverImage ? { coverImage } : {}),
    },
  });

  revalidatePath("/");
  revalidatePath("/discover");
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/events/${event.id}`);
  revalidatePath(`/dashboard/events/${event.id}/design`);
  revalidatePath(`/invite/${event.slug}`);

  await publishEventUpdate(
    [eventChannel(event.id), inviteChannel(event.slug), dashboardChannel(event.hostId)],
    {
      type: "EVENT_UPDATED",
      eventId: event.id,
      slug: event.slug,
      message: "Event design updated",
    },
  );

  redirect(`/dashboard/events/${event.id}/design?saved=1`);
}

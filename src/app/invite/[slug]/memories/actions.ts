"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { isClerkConfigured } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { uploadMemoryImage } from "@/lib/cloudinary";
import { publishEventUpdate } from "@/lib/realtime/ably-server";
import { dashboardChannel, eventChannel, inviteChannel } from "@/lib/realtime/events";
import { canGuestsUploadMemories } from "@/lib/event-lifecycle";
import { rsvpAccessCookieName } from "@/lib/rsvp-access";
import {
  initialMemoryUploadActionState,
  parseMemoryUploadFormData,
  validateMemoryImage,
  type MemoryUploadActionState,
} from "@/lib/validations/memory";

export async function uploadMemoryAction(
  state: MemoryUploadActionState = initialMemoryUploadActionState,
  formData: FormData,
): Promise<MemoryUploadActionState> {
  void state;

  const parsed = parseMemoryUploadFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message || "Check the memory details.",
    };
  }

  const file = formData.get("photo");
  const imageError = validateMemoryImage(file instanceof File ? file : null);

  if (imageError) {
    return { status: "error", message: imageError };
  }

  const event = await prisma.event.findUnique({
    where: { slug: parsed.data.slug },
    select: {
      id: true,
      slug: true,
      hostId: true,
      title: true,
      status: true,
      eventDate: true,
      eventTime: true,
      startsAt: true,
      endsAt: true,
      endedAt: true,
      cancelledAt: true,
      archivedAt: true,
      host: {
        select: {
          clerkId: true,
        },
      },
    },
  });

  if (!event || !(file instanceof File)) {
    return { status: "error", message: "This memories room is no longer available." };
  }

  if (!canGuestsUploadMemories(event)) {
    return { status: "error", message: "Memories open when the event is live or ended." };
  }

  const viewerUserId = isClerkConfigured() ? (await auth()).userId : null;
  const isOwner = Boolean(viewerUserId && event.host.clerkId === viewerUserId);
  const accessCookie = (await cookies()).get(rsvpAccessCookieName(event.id))?.value;
  const hasRsvpAccess =
    isOwner ||
    Boolean(
      accessCookie &&
        (await prisma.rSVP.findFirst({
          where: { id: accessCookie, eventId: event.id },
          select: { id: true },
        })),
    );

  if (!hasRsvpAccess) {
    return { status: "error", message: "RSVP first to add memories to this room." };
  }

  let uploaded: Awaited<ReturnType<typeof uploadMemoryImage>>;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    uploaded = await uploadMemoryImage({ buffer, eventId: event.id });
  } catch (error) {
    console.warn("Memory upload failed:", error);
    return {
      status: "error",
      message: "Photo uploads need Cloudinary setup. Add the Cloudinary env vars and try again.",
    };
  }

  const uploaderName = parsed.data.uploaderName || null;
  const caption = parsed.data.caption || null;
  const displayName = uploaderName || "Someone";
  const message = uploaderName
    ? `${displayName} added a memory`
    : "A new memory was added";

  await prisma.memoryPhoto.create({
    data: {
      eventId: event.id,
      imageUrl: uploaded.secure_url,
      publicId: uploaded.public_id,
      caption,
      uploadedBy: uploaderName,
      uploaderName,
      approved: true,
    },
  });

  await prisma.eventActivity.create({
    data: {
      eventId: event.id,
      type: "MEMORY_ADDED",
      message,
    },
  });

  revalidatePath(`/invite/${event.slug}`);
  revalidatePath(`/invite/${event.slug}/memories`);
  revalidatePath(`/dashboard/events/${event.id}`);
  revalidatePath("/dashboard");
  await publishEventUpdate(
    [eventChannel(event.id), inviteChannel(event.slug), dashboardChannel(event.hostId)],
    {
      type: "MEMORY_ADDED",
      eventId: event.id,
      slug: event.slug,
      message,
    },
  );

  return {
    status: "success",
    message: "Memory added to the room.",
  };
}

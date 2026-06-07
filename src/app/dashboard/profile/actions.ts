"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma";
import { getOrganizerHref } from "@/lib/profile";
import { publishEventUpdate } from "@/lib/realtime/ably-server";
import { dashboardChannel } from "@/lib/realtime/events";
import { parseProfileFormData } from "@/lib/validations/profile";

type ProfileActionResult =
  | { ok: true; message: string; href: string | null }
  | { ok: false; error: string };

export async function updateProfileAction(formData: FormData): Promise<ProfileActionResult> {
  await auth.protect();

  const currentUser = await getCurrentUser();

  if (currentUser.status === "database-not-configured") {
    return { ok: false, error: "Database is not configured yet." };
  }

  if (currentUser.status !== "ready" || !currentUser.dbUser) {
    return { ok: false, error: "Could not prepare your host profile." };
  }

  const parsed = parseProfileFormData(formData);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Check your profile details." };
  }

  const input = parsed.data;

  if (input.username) {
    const existing = await prisma.user.findFirst({
      where: {
        username: input.username,
        id: { not: currentUser.dbUser.id },
      },
      select: { id: true },
    });

    if (existing) {
      return { ok: false, error: "That username is already taken." };
    }
  }

  const updated = await prisma.user.update({
    where: { id: currentUser.dbUser.id },
    data: {
      name: input.name,
      username: input.username,
      bio: input.bio,
      location: input.location,
      instagramUrl: input.instagramUrl,
      websiteUrl: input.websiteUrl,
      publicProfile: input.publicProfile,
    },
    select: {
      id: true,
      username: true,
      name: true,
      publicProfile: true,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  revalidatePath("/discover");
  revalidatePath("/");

  if (currentUser.dbUser.username) {
    revalidatePath(`/u/${currentUser.dbUser.username}`);
  }

  if (updated.username) {
    revalidatePath(`/u/${updated.username}`);
  }

  await publishEventUpdate([dashboardChannel(updated.id)], {
    type: "PROFILE_UPDATED",
    eventId: updated.id,
    message: "Organizer profile updated",
  });

  return {
    ok: true,
    message: "Profile saved.",
    href: getOrganizerHref(updated),
  };
}

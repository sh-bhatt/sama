"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma";

async function requireLocalUser() {
  await auth.protect();

  const currentUser = await getCurrentUser();

  if (currentUser.status !== "ready" || !currentUser.dbUser) {
    throw new Error("Local user is not available.");
  }

  return currentUser.dbUser;
}

export async function deleteEventAction(formData: FormData) {
  const eventId = String(formData.get("eventId") || "");
  const user = await requireLocalUser();

  const event = await prisma.event.findFirst({
    where: { id: eventId, hostId: user.id },
    select: { id: true },
  });

  if (!event) {
    redirect("/dashboard");
  }

  await prisma.event.delete({ where: { id: event.id } });
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

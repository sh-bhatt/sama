"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import type { PaymentStatus } from "@prisma/client";
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

async function getOwnedRsvp(rsvpId: string) {
  const user = await requireLocalUser();

  return prisma.rSVP.findFirst({
    where: {
      id: rsvpId,
      event: { hostId: user.id },
    },
    include: {
      event: { select: { id: true } },
    },
  });
}

export async function updateRsvpCheckInAction(formData: FormData) {
  const rsvpId = String(formData.get("rsvpId") || "");
  const checkedIn = formData.get("checkedIn") === "true";
  const rsvp = await getOwnedRsvp(rsvpId);

  if (!rsvp) {
    redirect("/dashboard");
  }

  const updated = await prisma.rSVP.update({
    where: { id: rsvp.id },
    data: { checkedIn },
  });

  await prisma.eventActivity.create({
    data: {
      eventId: rsvp.eventId,
      type: "CHECK_IN_UPDATED",
      message: checkedIn
        ? `${updated.name} checked in`
        : `${updated.name} check-in removed`,
    },
  });

  revalidatePath(`/dashboard/events/${rsvp.eventId}`);
}

export async function checkInRsvpByIdAction(formData: FormData) {
  const rsvpId = String(formData.get("rsvpId") || "");
  const rsvp = await getOwnedRsvp(rsvpId);

  if (!rsvp) {
    redirect("/dashboard");
  }

  const updated = await prisma.rSVP.update({
    where: { id: rsvp.id },
    data: { checkedIn: true },
  });

  await prisma.eventActivity.create({
    data: {
      eventId: rsvp.eventId,
      type: "CHECK_IN_UPDATED",
      message: `${updated.name} checked in via QR`,
    },
  });

  revalidatePath(`/dashboard/events/${rsvp.eventId}`);
  revalidatePath(`/dashboard/events/${rsvp.eventId}/check-in`);
  revalidatePath("/dashboard");
}

export async function updateRsvpPaymentStatusAction(formData: FormData) {
  const rsvpId = String(formData.get("rsvpId") || "");
  const paymentStatus = String(formData.get("paymentStatus") || "") as PaymentStatus;

  if (!["NOT_REQUIRED", "PENDING", "PAID"].includes(paymentStatus)) {
    return;
  }

  const rsvp = await getOwnedRsvp(rsvpId);

  if (!rsvp) {
    redirect("/dashboard");
  }

  const updated = await prisma.rSVP.update({
    where: { id: rsvp.id },
    data: { paymentStatus },
  });

  await prisma.eventActivity.create({
    data: {
      eventId: rsvp.eventId,
      type: "PAYMENT_UPDATED",
      message: `${updated.name} payment marked ${paymentStatus.toLowerCase().replace("_", " ")}`,
    },
  });

  revalidatePath(`/dashboard/events/${rsvp.eventId}`);
}

export async function deleteRsvpAction(formData: FormData) {
  const rsvpId = String(formData.get("rsvpId") || "");
  const rsvp = await getOwnedRsvp(rsvpId);

  if (!rsvp) {
    redirect("/dashboard");
  }

  await prisma.rSVP.delete({ where: { id: rsvp.id } });
  await prisma.eventActivity.create({
    data: {
      eventId: rsvp.eventId,
      type: "RSVP_DELETED",
      message: `${rsvp.name} was removed from the guest list`,
    },
  });

  revalidatePath(`/dashboard/events/${rsvp.eventId}`);
}

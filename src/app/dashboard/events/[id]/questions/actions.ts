"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma";
import { publishEventUpdate } from "@/lib/realtime/ably-server";
import { dashboardChannel, eventChannel, inviteChannel } from "@/lib/realtime/events";
import {
  maxRsvpQuestionsPerEvent,
  parseRsvpQuestionFormData,
} from "@/lib/validations/rsvp-question";

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
  redirect(`/dashboard/events/${eventId}/questions?error=${encodeURIComponent(message)}`);
}

function revalidateQuestionSurfaces(eventId: string, slug: string) {
  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath(`/dashboard/events/${eventId}/questions`);
  revalidatePath(`/invite/${slug}`);
  revalidatePath("/dashboard");
}

async function publishQuestionChange({
  eventId,
  slug,
  hostId,
  type,
}: {
  eventId: string;
  slug: string;
  hostId: string;
  type: "RSVP_QUESTION_CREATED" | "RSVP_QUESTION_DELETED";
}) {
  await publishEventUpdate(
    [eventChannel(eventId), inviteChannel(slug), dashboardChannel(hostId)],
    { type, eventId, slug, message: "RSVP questions were updated" },
  );
}

export async function createRsvpQuestionAction(formData: FormData) {
  const parsed = parseRsvpQuestionFormData(formData);
  const eventId = String(formData.get("eventId") || "");

  if (!parsed.success) {
    redirectWithError(eventId, parsed.error.issues[0]?.message || "Check the question.");
  }

  const event = await requireOwnedEvent(parsed.data.eventId);
  const count = await prisma.rsvpQuestion.count({ where: { eventId: event.id } });

  if (count >= maxRsvpQuestionsPerEvent) {
    redirectWithError(event.id, "Use at most 8 RSVP questions per event.");
  }

  await prisma.rsvpQuestion.create({ data: parsed.data });
  await prisma.eventActivity.create({
    data: {
      eventId: event.id,
      type: "RSVP_QUESTION_CREATED",
      message: "RSVP questions were updated",
    },
  });

  revalidateQuestionSurfaces(event.id, event.slug);
  await publishQuestionChange({
    eventId: event.id,
    slug: event.slug,
    hostId: event.hostId,
    type: "RSVP_QUESTION_CREATED",
  });
}

export async function deleteRsvpQuestionAction(formData: FormData) {
  const questionId = String(formData.get("questionId") || "");
  await auth.protect();

  const currentUser = await getCurrentUser();

  if (currentUser.status !== "ready" || !currentUser.dbUser) {
    throw new Error("Local user is not available.");
  }

  const question = await prisma.rsvpQuestion.findFirst({
    where: { id: questionId, event: { hostId: currentUser.dbUser.id } },
    include: { event: { select: { id: true, slug: true, hostId: true } } },
  });

  if (!question) {
    redirect("/dashboard");
  }

  await prisma.rsvpQuestion.delete({ where: { id: question.id } });
  await prisma.eventActivity.create({
    data: {
      eventId: question.eventId,
      type: "RSVP_QUESTION_DELETED",
      message: "RSVP questions were updated",
    },
  });

  revalidateQuestionSurfaces(question.eventId, question.event.slug);
  await publishQuestionChange({
    eventId: question.eventId,
    slug: question.event.slug,
    hostId: question.event.hostId,
    type: "RSVP_QUESTION_DELETED",
  });
}

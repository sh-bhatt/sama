"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { pollDateStringToDate, parseDatePollFormData } from "@/lib/validations/date-poll";
import { prisma } from "@/lib/prisma";
import { publishEventUpdate } from "@/lib/realtime/ably-server";
import { dashboardChannel, eventChannel, inviteChannel } from "@/lib/realtime/events";

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
  redirect(`/dashboard/events/${eventId}/date-poll?error=${encodeURIComponent(message)}`);
}

export async function createDatePollAction(formData: FormData) {
  const eventId = String(formData.get("eventId") || "");
  const event = await requireOwnedEvent(eventId);
  const parsed = parseDatePollFormData(formData);

  if (!parsed.success) {
    redirectWithError(event.id, parsed.error.issues[0]?.message || "Check the poll details.");
  }

  const existingPoll = await prisma.datePoll.findFirst({
    where: { eventId: event.id },
    select: { id: true },
  });

  if (existingPoll) {
    redirectWithError(event.id, "This event already has a date poll.");
  }

  await prisma.datePoll.create({
    data: {
      eventId: event.id,
      question: parsed.data.question,
      options: {
        create: parsed.data.options.map((option) => ({
          optionDate: pollDateStringToDate(option.optionDate),
          label: option.label,
        })),
      },
    },
  });

  await prisma.eventActivity.create({
    data: {
      eventId: event.id,
      type: "POLL_CREATED",
      message: "Date poll created",
    },
  });

  revalidatePath(`/dashboard/events/${event.id}`);
  revalidatePath(`/dashboard/events/${event.id}/date-poll`);
  revalidatePath(`/invite/${event.slug}`);
  revalidatePath("/dashboard");
  await publishEventUpdate(
    [eventChannel(event.id), inviteChannel(event.slug), dashboardChannel(event.hostId)],
    {
      type: "POLL_CREATED",
      eventId: event.id,
      slug: event.slug,
      message: "Date poll created",
    },
  );
  redirect(`/dashboard/events/${event.id}`);
}

export async function deleteDatePollAction(formData: FormData) {
  const pollId = String(formData.get("pollId") || "");
  await auth.protect();

  const currentUser = await getCurrentUser();

  if (currentUser.status !== "ready" || !currentUser.dbUser) {
    throw new Error("Local user is not available.");
  }

  const poll = await prisma.datePoll.findFirst({
    where: { id: pollId, event: { hostId: currentUser.dbUser.id } },
    include: { event: { select: { id: true, slug: true, hostId: true } } },
  });

  if (!poll) {
    redirect("/dashboard");
  }

  await prisma.datePoll.delete({ where: { id: poll.id } });
  await prisma.eventActivity.create({
    data: {
      eventId: poll.eventId,
      type: "POLL_DELETED",
      message: "Date poll removed",
    },
  });

  revalidatePath(`/dashboard/events/${poll.eventId}`);
  revalidatePath(`/dashboard/events/${poll.eventId}/date-poll`);
  revalidatePath(`/invite/${poll.event.slug}`);
  revalidatePath("/dashboard");
  await publishEventUpdate(
    [
      eventChannel(poll.eventId),
      inviteChannel(poll.event.slug),
      dashboardChannel(poll.event.hostId),
    ],
    {
      type: "POLL_DELETED",
      eventId: poll.eventId,
      slug: poll.event.slug,
      message: "Date poll removed",
    },
  );
  redirect(`/dashboard/events/${poll.eventId}`);
}

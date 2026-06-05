"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  initialRsvpActionState,
  parseRsvpFormData,
  type RsvpActionState,
} from "@/lib/validations/rsvp";
import {
  initialPollVoteActionState,
  parsePollVoteFormData,
  type PollVoteActionState,
} from "@/lib/validations/date-poll";
import { publishEventUpdate } from "@/lib/realtime/ably-server";
import { dashboardChannel, eventChannel, inviteChannel } from "@/lib/realtime/events";

function statusMessage(name: string, status: "GOING" | "MAYBE" | "NOT_GOING") {
  if (status === "GOING") {
    return `${name} is going`;
  }

  if (status === "MAYBE") {
    return `${name} switched to maybe`;
  }

  return `${name} can't make it`;
}

export async function submitRsvpAction(
  state: RsvpActionState = initialRsvpActionState,
  formData: FormData,
): Promise<RsvpActionState> {
  void state;

  const parsed = parseRsvpFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message || "Check your RSVP details.",
    };
  }

  const input = parsed.data;
  const event = await prisma.event.findUnique({
    where: { slug: input.slug },
    select: { id: true, slug: true, hostId: true, capacity: true },
  });

  if (!event) {
    return { status: "error", message: "This invite is no longer available." };
  }

  const existingRsvp =
    input.email || input.phone
      ? await prisma.rSVP.findFirst({
          where: {
            eventId: event.id,
            OR: [
              ...(input.email ? [{ email: input.email }] : []),
              ...(input.phone ? [{ phone: input.phone }] : []),
            ],
          },
        })
      : null;

  if (event.capacity && input.status === "GOING" && existingRsvp?.status !== "GOING") {
    const goingCount = await prisma.rSVP.count({
      where: { eventId: event.id, status: "GOING" },
    });

    if (goingCount >= event.capacity) {
      return {
        status: "error",
        message: "This room is full for going RSVPs. Maybe is still open.",
      };
    }
  }

  const activityType = existingRsvp ? "RSVP_UPDATED" : "RSVP_CREATED";
  const rsvp = existingRsvp
    ? await prisma.rSVP.update({
        where: { id: existingRsvp.id },
        data: {
          name: input.name,
          email: input.email,
          phone: input.phone,
          status: input.status,
          plusOne: input.plusOne,
          note: input.note,
        },
      })
    : await prisma.rSVP.create({
        data: {
          eventId: event.id,
          name: input.name,
          email: input.email,
          phone: input.phone,
          status: input.status,
          plusOne: input.plusOne,
          note: input.note,
        },
      });

  await prisma.eventActivity.create({
    data: {
      eventId: event.id,
      type: activityType,
      message: statusMessage(rsvp.name, rsvp.status),
    },
  });

  revalidatePath(`/invite/${event.slug}`);
  revalidatePath(`/dashboard/events/${event.id}`);
  revalidatePath(`/dashboard/events/${event.id}/check-in`);
  revalidatePath("/dashboard");
  await publishEventUpdate(
    [eventChannel(event.id), inviteChannel(event.slug), dashboardChannel(event.hostId)],
    {
      type: activityType,
      eventId: event.id,
      slug: event.slug,
      message: statusMessage(rsvp.name, rsvp.status),
    },
  );

  return {
    status: "success",
    message: existingRsvp ? "RSVP updated." : "You're on the list.",
  };
}

export async function submitPollVoteAction(
  state: PollVoteActionState = initialPollVoteActionState,
  formData: FormData,
): Promise<PollVoteActionState> {
  void state;

  const parsed = parsePollVoteFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message || "Check your vote details.",
    };
  }

  const input = parsed.data;
  const event = await prisma.event.findUnique({
    where: { slug: input.slug },
    include: {
      datePolls: {
        where: { id: input.pollId },
        include: { options: { select: { id: true } } },
      },
    },
  });

  const poll = event?.datePolls[0];

  if (!event || !poll) {
    return { status: "error", message: "This date poll is no longer available." };
  }

  const allowedOptionIds = new Set(poll.options.map((option) => option.id));
  const selectedOptionIds = input.selectedOptionIds.filter((optionId) =>
    allowedOptionIds.has(optionId),
  );

  if (!selectedOptionIds.length || selectedOptionIds.length > poll.options.length) {
    return { status: "error", message: "Pick at least one available date." };
  }

  const cleanedPhone = input.guestPhone?.replace(/\s+/g, "");
  const previousVoteCleanup = cleanedPhone
    ? await prisma.pollVote.deleteMany({
      where: {
        guestPhone: cleanedPhone,
        option: { pollId: poll.id },
      },
    })
    : { count: 0 };
  const hadPreviousVote = previousVoteCleanup.count > 0;

  await prisma.pollVote.createMany({
    data: selectedOptionIds.map((optionId) => ({
      optionId,
      guestName: input.guestName,
      guestPhone: cleanedPhone,
    })),
  });

  await prisma.eventActivity.create({
    data: {
      eventId: event.id,
      type: "POLL_VOTE_CREATED",
      message: `${input.guestName} ${hadPreviousVote ? "updated their vote" : "voted on the date poll"}`,
    },
  });

  revalidatePath(`/invite/${event.slug}`);
  revalidatePath(`/dashboard/events/${event.id}`);
  revalidatePath(`/dashboard/events/${event.id}/date-poll`);
  revalidatePath("/dashboard");
  await publishEventUpdate(
    [eventChannel(event.id), inviteChannel(event.slug), dashboardChannel(event.hostId)],
    {
      type: "POLL_VOTE_CREATED",
      eventId: event.id,
      slug: event.slug,
      message: `${input.guestName} ${hadPreviousVote ? "updated their vote" : "voted on the date poll"}`,
    },
  );

  return {
    status: "success",
    message: hadPreviousVote ? "Vote updated." : "Vote saved.",
  };
}

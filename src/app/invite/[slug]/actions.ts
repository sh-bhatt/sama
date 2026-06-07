"use server";

import { revalidatePath } from "next/cache";
import type { ApprovalStatus, RSVPStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  initialRsvpActionState,
  parseRsvpFormData,
  type RsvpActionState,
} from "@/lib/validations/rsvp";
import { parseRsvpAnswers } from "@/lib/validations/rsvp-question";
import {
  initialPollVoteActionState,
  parsePollVoteFormData,
  type PollVoteActionState,
} from "@/lib/validations/date-poll";
import { publishEventUpdate } from "@/lib/realtime/ably-server";
import { dashboardChannel, eventChannel, inviteChannel } from "@/lib/realtime/events";

function statusMessage(name: string, status: RSVPStatus, approvalStatus: ApprovalStatus) {
  if (approvalStatus === "PENDING") {
    return `${name} requested to join`;
  }

  if (approvalStatus === "WAITLISTED") {
    return `${name} joined the waitlist`;
  }

  if (status === "GOING") {
    return `${name} is going`;
  }

  if (status === "MAYBE") {
    return `${name} switched to maybe`;
  }

  return `${name} can't make it`;
}

function successMessage(approvalStatus: ApprovalStatus, existingRsvp: boolean) {
  if (approvalStatus === "PENDING") {
    return "Your request has been sent to the host.";
  }

  if (approvalStatus === "WAITLISTED") {
    return "You're on the waitlist.";
  }

  if (approvalStatus === "REJECTED") {
    return "Your RSVP is saved, but it is not approved yet.";
  }

  return existingRsvp ? "RSVP updated." : "You're on the list.";
}

async function resolveApprovalStatus({
  eventId,
  capacity,
  requiresApproval,
  waitlistEnabled,
  inputStatus,
  existingStatus,
  existingApprovalStatus,
}: {
  eventId: string;
  capacity: number | null;
  requiresApproval: boolean;
  waitlistEnabled: boolean;
  inputStatus: RSVPStatus;
  existingStatus?: RSVPStatus;
  existingApprovalStatus?: ApprovalStatus;
}) {
  if (inputStatus === "NOT_GOING") {
    return "APPROVED" satisfies ApprovalStatus;
  }

  if (inputStatus === "GOING" && capacity) {
    const approvedGoingCount = await prisma.rSVP.count({
      where: {
        eventId,
        status: "GOING",
        approvalStatus: "APPROVED",
        ...(existingStatus === "GOING" && existingApprovalStatus === "APPROVED"
          ? {}
          : {}),
      },
    });
    const isAlreadyApprovedGoing =
      existingStatus === "GOING" && existingApprovalStatus === "APPROVED";

    if (!isAlreadyApprovedGoing && approvedGoingCount >= capacity) {
      if (waitlistEnabled) {
        return "WAITLISTED" satisfies ApprovalStatus;
      }

      return null;
    }
  }

  if (requiresApproval) {
    return "PENDING" satisfies ApprovalStatus;
  }

  return "APPROVED" satisfies ApprovalStatus;
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
    select: {
      id: true,
      slug: true,
      hostId: true,
      capacity: true,
      requiresApproval: true,
      waitlistEnabled: true,
      rsvpQuestions: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!event) {
    return { status: "error", message: "This invite is no longer available." };
  }

  const parsedAnswers = parseRsvpAnswers(formData, event.rsvpQuestions);

  if (!parsedAnswers.success) {
    return { status: "error", message: parsedAnswers.message };
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

  const approvalStatus = await resolveApprovalStatus({
    eventId: event.id,
    capacity: event.capacity,
    requiresApproval: event.requiresApproval,
    waitlistEnabled: event.waitlistEnabled,
    inputStatus: input.status,
    existingStatus: existingRsvp?.status,
    existingApprovalStatus: existingRsvp?.approvalStatus,
  });

  if (!approvalStatus) {
    return {
      status: "error",
      message: "This room is full for going RSVPs.",
    };
  }

  const activityType = approvalStatus === "WAITLISTED" ? "RSVP_WAITLISTED" : existingRsvp ? "RSVP_UPDATED" : "RSVP_CREATED";
  const rsvp = existingRsvp
    ? await prisma.rSVP.update({
        where: { id: existingRsvp.id },
        data: {
          name: input.name,
          email: input.email,
          phone: input.phone,
          status: input.status,
          approvalStatus,
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
          approvalStatus,
          plusOne: input.plusOne,
          note: input.note,
        },
      });

  await prisma.eventActivity.create({
    data: {
      eventId: event.id,
      type: activityType,
      message: statusMessage(rsvp.name, rsvp.status, rsvp.approvalStatus),
    },
  });

  const questionIds = event.rsvpQuestions.map((question) => question.id);

  if (questionIds.length > 0) {
    await prisma.rsvpAnswer.deleteMany({
      where: { rsvpId: rsvp.id, questionId: { in: questionIds } },
    });

    if (parsedAnswers.answers.length > 0) {
      await prisma.rsvpAnswer.createMany({
        data: parsedAnswers.answers.map((answer) => ({
          rsvpId: rsvp.id,
          questionId: answer.questionId,
          answer: answer.answer,
        })),
      });
    }
  }

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
      message: statusMessage(rsvp.name, rsvp.status, rsvp.approvalStatus),
    },
  );

  return {
    status: "success",
    message: successMessage(rsvp.approvalStatus, Boolean(existingRsvp)),
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

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  initialRsvpActionState,
  parseRsvpFormData,
  type RsvpActionState,
} from "@/lib/validations/rsvp";

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
    select: { id: true, slug: true, capacity: true },
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

  return {
    status: "success",
    message: existingRsvp ? "RSVP updated." : "You're on the list.",
  };
}

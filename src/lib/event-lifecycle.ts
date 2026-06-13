import type { EventStatus } from "@prisma/client";

export type EventLifecycleStatus = "upcoming" | "live" | "ended" | "cancelled" | "archived";

type EventTimingInput = {
  status?: EventStatus | null;
  eventDate?: Date | null;
  eventTime?: string | null;
  startsAt?: Date | null;
  endsAt?: Date | null;
  endedAt?: Date | null;
  cancelledAt?: Date | null;
  archivedAt?: Date | null;
};

const defaultDurationMs = 6 * 60 * 60 * 1000;
const earlyCheckInWindowMs = 2 * 60 * 60 * 1000;

export function eventDateTimeToDate(eventDate: Date, eventTime?: string | null) {
  const [hourValue = "0", minuteValue = "0"] = (eventTime || "00:00").split(":");
  const startsAt = new Date(eventDate);
  startsAt.setHours(Number(hourValue) || 0, Number(minuteValue) || 0, 0, 0);
  return startsAt;
}

export function addEventDuration(startsAt: Date, durationHours: number) {
  const endsAt = new Date(startsAt);
  endsAt.setHours(endsAt.getHours() + durationHours);
  return endsAt;
}

export function getEventTiming(event: EventTimingInput) {
  const startsAt =
    event.startsAt ||
    (event.eventDate ? eventDateTimeToDate(event.eventDate, event.eventTime) : null);
  const endsAt =
    event.endsAt ||
    (startsAt ? new Date(startsAt.getTime() + defaultDurationMs) : null);

  return { startsAt, endsAt };
}

export function getDerivedEventStatus(event: EventTimingInput, now = new Date()): EventLifecycleStatus {
  if (event.status === "CANCELLED") return "cancelled";
  if (event.status === "ARCHIVED") return "archived";
  if (event.status === "ENDED") return "ended";
  if (event.status === "LIVE") return "live";

  const { startsAt, endsAt } = getEventTiming(event);

  if (!startsAt || !endsAt) {
    return "upcoming";
  }

  if (now < startsAt) {
    return "upcoming";
  }

  if (now <= endsAt) {
    return "live";
  }

  return "ended";
}

export function getEventLifecycleLabel(event: EventTimingInput) {
  const status = getDerivedEventStatus(event);

  if (status === "live") return "Live now";
  if (status === "ended") return "Ended";
  if (status === "cancelled") return "Cancelled";
  if (status === "archived") return "Archived";
  return "Upcoming";
}

export function isEventUpcoming(event: EventTimingInput) {
  return getDerivedEventStatus(event) === "upcoming";
}

export function isEventLive(event: EventTimingInput) {
  return getDerivedEventStatus(event) === "live";
}

export function isEventEnded(event: EventTimingInput) {
  return getDerivedEventStatus(event) === "ended";
}

export function isEventCancelled(event: EventTimingInput) {
  return getDerivedEventStatus(event) === "cancelled";
}

export function isEventArchived(event: EventTimingInput) {
  return getDerivedEventStatus(event) === "archived";
}

export function canGuestsRsvp(event: EventTimingInput) {
  const status = getDerivedEventStatus(event);
  return status === "upcoming" || status === "live";
}

export function canGuestsVotePoll(event: EventTimingInput) {
  return isEventUpcoming(event);
}

export function canGuestsUploadMemories(event: EventTimingInput) {
  const status = getDerivedEventStatus(event);
  return status === "live" || status === "ended";
}

export function canHostCheckInGuests(event: EventTimingInput, now = new Date()) {
  const status = getDerivedEventStatus(event, now);

  if (status === "live") {
    return true;
  }

  if (status !== "upcoming") {
    return false;
  }

  const { startsAt } = getEventTiming(event);
  return Boolean(startsAt && now >= new Date(startsAt.getTime() - earlyCheckInWindowMs));
}

export function canHostBroadcast(event: EventTimingInput) {
  const status = getDerivedEventStatus(event);
  return status !== "cancelled" && status !== "archived";
}

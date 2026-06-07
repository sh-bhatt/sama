export const realtimeMessageName = "sama:event-update";

export const realtimeEventTypes = [
  "RSVP_CREATED",
  "RSVP_UPDATED",
  "RSVP_DELETED",
  "RSVP_APPROVAL_UPDATED",
  "RSVP_WAITLISTED",
  "RSVP_REJECTED",
  "WAITLIST_APPROVED",
  "CHECK_IN_UPDATED",
  "PAYMENT_UPDATED",
  "POLL_CREATED",
  "POLL_DELETED",
  "POLL_VOTE_CREATED",
  "EVENT_UPDATED",
  "EVENT_DELETED",
  "MEMORY_ADDED",
  "MEMORY_DELETED",
  "MEMORY_UPDATED",
  "INFO_BLOCK_CREATED",
  "INFO_BLOCK_UPDATED",
  "INFO_BLOCK_DELETED",
  "RSVP_QUESTION_CREATED",
  "RSVP_QUESTION_UPDATED",
  "RSVP_QUESTION_DELETED",
  "RSVP_ANSWER_UPDATED",
  "BROADCAST_CREATED",
  "BROADCAST_DELETED",
  "BROADCAST_UPDATED",
  "BROADCAST_PINNED",
  "INTEREST_CREATED",
  "INTEREST_REMOVED",
  "PROFILE_UPDATED",
] as const;

export type RealtimeEventType = (typeof realtimeEventTypes)[number];

export type RealtimeEventPayload = {
  type: RealtimeEventType;
  eventId: string;
  slug?: string;
  message?: string;
  timestamp: string;
};

export function eventChannel(eventId: string) {
  return `event:${eventId}`;
}

export function dashboardChannel(userId: string) {
  return `dashboard:${userId}`;
}

export function inviteChannel(slug: string) {
  return `invite:${slug}`;
}

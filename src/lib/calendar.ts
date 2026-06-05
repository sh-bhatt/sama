type CalendarEvent = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  eventDate: Date;
  eventTime: string;
  location: string;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function parseTime(eventTime: string) {
  const [hours = "18", minutes = "00"] = eventTime.split(":");

  return {
    hours: Number(hours) || 18,
    minutes: Number(minutes) || 0,
  };
}

function calendarDateParts(eventDate: Date, eventTime: string, durationHours = 2) {
  const { hours, minutes } = parseTime(eventTime);
  const startUtcMs = Date.UTC(
    eventDate.getUTCFullYear(),
    eventDate.getUTCMonth(),
    eventDate.getUTCDate(),
    hours - 5,
    minutes - 30,
  );
  const endUtcMs = startUtcMs + durationHours * 60 * 60 * 1000;

  return {
    startUtc: new Date(startUtcMs),
    endUtc: new Date(endUtcMs),
    localDate: `${eventDate.getUTCFullYear()}${pad(eventDate.getUTCMonth() + 1)}${pad(eventDate.getUTCDate())}`,
    localTime: `${pad(hours)}${pad(minutes)}00`,
  };
}

function formatUtcCalendarDate(value: Date) {
  return `${value.getUTCFullYear()}${pad(value.getUTCMonth() + 1)}${pad(value.getUTCDate())}T${pad(value.getUTCHours())}${pad(value.getUTCMinutes())}${pad(value.getUTCSeconds())}Z`;
}

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\r?\n/g, "\\n");
}

export function formatDateForCalendar(eventDate: Date, eventTime: string) {
  const { startUtc, endUtc, localDate, localTime } = calendarDateParts(eventDate, eventTime);

  return {
    googleStart: formatUtcCalendarDate(startUtc),
    googleEnd: formatUtcCalendarDate(endUtc),
    icsStart: `${localDate}T${localTime}`,
    icsEnd: formatUtcCalendarDate(endUtc),
    now: formatUtcCalendarDate(new Date()),
  };
}

export function createGoogleCalendarUrl(event: CalendarEvent, inviteUrl: string) {
  const dates = formatDateForCalendar(event.eventDate, event.eventTime);
  const details = [event.description, `Invite: ${inviteUrl}`].filter(Boolean).join("\n\n");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${dates.googleStart}/${dates.googleEnd}`,
    details,
    location: event.location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function createIcsContent(event: CalendarEvent, inviteUrl: string) {
  const dates = formatDateForCalendar(event.eventDate, event.eventTime);
  const description = [event.description, `Invite: ${inviteUrl}`].filter(Boolean).join("\n\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sama//Event Invite//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:sama-${event.id}@sama.local`,
    `DTSTAMP:${dates.now}`,
    `DTSTART;TZID=Asia/Kolkata:${dates.icsStart}`,
    `DTEND:${dates.icsEnd}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(event.location)}`,
    `URL:${escapeIcsText(inviteUrl)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

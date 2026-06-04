export function createWhatsAppShareUrl(eventTitle: string, eventUrl: string) {
  const message = `You're invited to ${eventTitle} - RSVP here: ${eventUrl}`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

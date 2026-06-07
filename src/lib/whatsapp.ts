export function createWhatsAppShareUrl(eventTitle: string, eventUrl: string) {
  const message = `You're invited to ${eventTitle} - RSVP here: ${eventUrl}`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function createBroadcastWhatsAppText({
  eventTitle,
  inviteUrl,
  broadcastTitle,
  broadcastMessage,
}: {
  eventTitle: string;
  inviteUrl: string;
  broadcastTitle: string;
  broadcastMessage: string;
}) {
  return `Update for ${eventTitle} ✨

${broadcastTitle}
${broadcastMessage}

Event link: ${inviteUrl}`;
}

export function createWhatsAppTextUrl(message: string) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

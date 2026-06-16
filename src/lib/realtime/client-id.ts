"use client";

const guestIdStorageKey = "sama:realtime:guest-id";

function createGuestUuid() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return [...bytes]
    .map((byte, index) => {
      const value = byte.toString(16).padStart(2, "0");
      return [4, 6, 8, 10].includes(index) ? `-${value}` : value;
    })
    .join("");
}

export function normalizeRealtimeUserClientId(clerkUserId?: string | null) {
  return clerkUserId ? `user:${clerkUserId}` : null;
}

export function getStableRealtimeClientId(clerkUserId?: string | null) {
  const userClientId = normalizeRealtimeUserClientId(clerkUserId);

  if (userClientId) {
    return userClientId;
  }

  if (typeof window === "undefined") {
    return null;
  }

  const existingGuestId = window.localStorage.getItem(guestIdStorageKey);

  if (existingGuestId) {
    return `guest:${existingGuestId}`;
  }

  const guestId = createGuestUuid();
  window.localStorage.setItem(guestIdStorageKey, guestId);

  return `guest:${guestId}`;
}

export type OrganizerProfile = {
  id?: string;
  username?: string | null;
  name?: string | null;
  email?: string | null;
  imageUrl?: string | null;
  publicProfile?: boolean;
};

export function normalizeUsername(input: FormDataEntryValue | string | null | undefined) {
  if (typeof input !== "string") {
    return undefined;
  }

  const normalized = input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "");

  return normalized || undefined;
}

export function isValidUsername(input: string) {
  return /^[a-z0-9_-]{3,32}$/.test(input);
}

export function getDisplayName(user: OrganizerProfile) {
  return user.name || user.username || "Sama host";
}

export function getOrganizerHref(user: OrganizerProfile) {
  if (user.publicProfile === false || !user.username) {
    return null;
  }

  return `/u/${user.username}`;
}

export function normalizeOptionalUrl(input: FormDataEntryValue | string | null | undefined) {
  if (typeof input !== "string") {
    return undefined;
  }

  const value = input.trim();

  if (!value) {
    return undefined;
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `https://${value}`;
}

export function normalizeInstagram(input: FormDataEntryValue | string | null | undefined) {
  if (typeof input !== "string") {
    return undefined;
  }

  const value = input.trim().replace(/^@/, "");

  if (!value) {
    return undefined;
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  const handle = value.replace(/^instagram\.com\//, "").replace(/^www\.instagram\.com\//, "");
  return `https://instagram.com/${handle}`;
}

export const eventThemes = [
  {
    key: "mehfil",
    label: "Mehfil",
    description: "soft lamps, live music, close-circle energy",
    gradientClass: "from-fuchsia-950 via-rose-600 to-saffron-200",
    accentClass: "bg-saffron-200 text-zinc-950",
    previewBadge: "modern mehfil",
    inviteTheme: "mehfil",
  },
  {
    key: "neon",
    label: "Neon",
    description: "electric city nights and loud group chats",
    gradientClass: "from-electric via-rose-neon to-lime-mute",
    accentClass: "bg-lime-mute text-zinc-950",
    previewBadge: "neon room",
    inviteTheme: "neon",
  },
  {
    key: "sunset",
    label: "Sunset",
    description: "golden hour, rooftops, and warm photos",
    gradientClass: "from-orange-500 via-rose-neon to-amber-200",
    accentClass: "bg-amber-200 text-zinc-950",
    previewBadge: "sunset social",
    inviteTheme: "sunset",
  },
  {
    key: "indie",
    label: "Indie",
    description: "listening rooms, zines, and new voices",
    gradientClass: "from-blue-500 via-fuchsia-700 to-rose-neon",
    accentClass: "bg-blue-200 text-zinc-950",
    previewBadge: "indie set",
    inviteTheme: "neon",
  },
  {
    key: "minimal",
    label: "Minimal",
    description: "clean, sharp, gallery-like invites",
    gradientClass: "from-zinc-950 via-zinc-800 to-stone-400",
    accentClass: "bg-ivory text-zinc-950",
    previewBadge: "minimal room",
    inviteTheme: "afterdark",
  },
  {
    key: "afterdark",
    label: "Afterdark",
    description: "late-night bass, glass, and deep color",
    gradientClass: "from-zinc-950 via-fuchsia-900 to-blue-500",
    accentClass: "bg-rose-neon text-white",
    previewBadge: "afterdark",
    inviteTheme: "afterdark",
  },
  {
    key: "pop",
    label: "Pop",
    description: "bright, playful, everyone-in-the-photo energy",
    gradientClass: "from-rose-neon via-orange-400 to-lime-mute",
    accentClass: "bg-rose-neon text-white",
    previewBadge: "pop night",
    inviteTheme: "sunset",
  },
] as const;

export type EventThemeKey = (typeof eventThemes)[number]["key"];
export type InviteThemeKey = (typeof eventThemes)[number]["inviteTheme"];

export const eventThemeKeys = eventThemes.map((theme) => theme.key) as [
  EventThemeKey,
  ...EventThemeKey[],
];

export function getEventTheme(value?: string | null) {
  const normalized = value?.trim().toLowerCase();

  return (
    eventThemes.find((theme) => theme.key === normalized || theme.label.toLowerCase() === normalized) ??
    eventThemes[0]
  );
}

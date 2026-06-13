export const discoverCategories = [
  "Music",
  "College",
  "Arts",
  "Food",
  "Workshops",
  "Nightlife",
  "Community",
  "Open Mic",
  "Trips",
];

export const discoverCities = [
  "Delhi NCR",
  "Bengaluru",
  "Mumbai",
  "Pune",
  "Hyderabad",
  "Jaipur",
  "Chandigarh",
  "Goa",
  "Kolkata",
];

export type PublicDiscoveryEvent = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  eventDate: Date;
  eventTime: string;
  location: string;
  city: string | null;
  category: string | null;
  theme: string;
  coverImage: string | null;
  cardDesign?: unknown;
  status?: "DRAFT" | "PUBLISHED" | "LIVE" | "ENDED" | "CANCELLED" | "ARCHIVED" | null;
  startsAt?: Date | null;
  endsAt?: Date | null;
  endedAt?: Date | null;
  cancelledAt?: Date | null;
  archivedAt?: Date | null;
  capacity: number | null;
  requiresApproval: boolean;
  waitlistEnabled: boolean;
  host: {
    name: string | null;
    imageUrl?: string | null;
    username?: string | null;
    publicProfile?: boolean;
  };
  _count: {
    interests: number;
    rsvps: number;
  };
  rsvps?: Array<{
    status: "GOING" | "MAYBE" | "NOT_GOING";
    approvalStatus: "APPROVED" | "PENDING" | "REJECTED" | "WAITLISTED";
  }>;
};

export function getApprovedGoingCount(event: PublicDiscoveryEvent) {
  return (
    event.rsvps?.filter(
      (rsvp) => rsvp.status === "GOING" && rsvp.approvalStatus === "APPROVED",
    ).length ?? event._count.rsvps
  );
}

export function getHostLabel(event: PublicDiscoveryEvent) {
  return event.host.name || event.host.username || "Sama host";
}

export function getHostInitials(event: PublicDiscoveryEvent) {
  return getHostLabel(event).slice(0, 2).toUpperCase();
}

export function getPosterVariant(event: Pick<PublicDiscoveryEvent, "category" | "theme">) {
  const value = `${event.category || ""} ${event.theme}`.toLowerCase();

  if (value.includes("food") || value.includes("cafe")) return "from-amber-200 via-orange-500 to-red-700";
  if (value.includes("college") || value.includes("campus")) return "from-red-500 via-orange-400 to-yellow-200";
  if (value.includes("workshop") || value.includes("community")) return "from-lime-300 via-emerald-500 to-zinc-950";
  if (value.includes("art") || value.includes("open mic")) return "from-sky-400 via-blue-700 to-fuchsia-700";
  if (value.includes("night") || value.includes("after")) return "from-fuchsia-600 via-rose-500 to-orange-300";

  return "from-zinc-950 via-fuchsia-900 to-rose-500";
}

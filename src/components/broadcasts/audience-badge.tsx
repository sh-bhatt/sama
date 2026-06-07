import type { BroadcastAudience } from "@prisma/client";

const audienceStyles: Record<BroadcastAudience, string> = {
  ALL: "bg-ivory text-zinc-950",
  GOING: "bg-lime-mute text-zinc-950",
  MAYBE: "bg-saffron-200 text-zinc-950",
  APPROVED: "bg-emerald-400/18 text-emerald-300 border border-emerald-300/30",
  PENDING: "bg-yellow-300/18 text-yellow-200 border border-yellow-200/30",
  WAITLISTED: "bg-electric/18 text-electric border border-electric/35",
};

export function AudienceBadge({ audience }: { audience: BroadcastAudience }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${audienceStyles[audience]}`}>
      {audience.toLowerCase()}
    </span>
  );
}

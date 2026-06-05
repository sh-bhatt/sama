import type { RSVPStatus } from "@prisma/client";

const statusStyles: Record<RSVPStatus, string> = {
  GOING: "bg-lime-mute text-zinc-950",
  MAYBE: "bg-saffron-200 text-zinc-950",
  NOT_GOING: "bg-rose-neon/18 text-rose-neon",
};

const statusLabels: Record<RSVPStatus, string> = {
  GOING: "Going",
  MAYBE: "Maybe",
  NOT_GOING: "Can't go",
};

export function RsvpStatusBadge({ status }: { status: RSVPStatus }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${statusStyles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}

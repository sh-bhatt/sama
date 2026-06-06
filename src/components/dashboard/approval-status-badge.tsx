import type { ApprovalStatus } from "@prisma/client";

const approvalStyles: Record<ApprovalStatus, string> = {
  APPROVED: "bg-lime-mute text-zinc-950",
  PENDING: "bg-saffron-200 text-zinc-950",
  WAITLISTED: "bg-electric/18 text-electric border border-electric/35",
  REJECTED: "bg-rose-neon/14 text-rose-neon border border-rose-neon/30",
};

export function ApprovalStatusBadge({ status }: { status: ApprovalStatus }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${approvalStyles[status]}`}>
      {status.toLowerCase()}
    </span>
  );
}

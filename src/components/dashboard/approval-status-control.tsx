"use client";

import type { ApprovalStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { updateRsvpApprovalStatusAction } from "@/app/dashboard/events/[id]/actions";

const statuses: ApprovalStatus[] = ["APPROVED", "PENDING", "WAITLISTED", "REJECTED"];

export function ApprovalStatusControl({
  rsvpId,
  approvalStatus,
}: {
  rsvpId: string;
  approvalStatus: ApprovalStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleAction(formData: FormData) {
    startTransition(async () => {
      await updateRsvpApprovalStatusAction(formData);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status) => (
        <form key={status} action={handleAction}>
          <input type="hidden" name="rsvpId" value={rsvpId} />
          <input type="hidden" name="approvalStatus" value={status} />
          <button
            type="submit"
            disabled={pending || approvalStatus === status}
            className={[
              "focus-ring rounded-full px-3 py-2 text-xs font-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55",
              approvalStatus === status
                ? "bg-lime-mute text-zinc-950"
                : "bg-[color:var(--card)] text-[color:var(--foreground)]",
            ].join(" ")}
          >
            {status.toLowerCase()}
          </button>
        </form>
      ))}
    </div>
  );
}

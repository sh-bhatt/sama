"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { updateRsvpCheckInAction } from "@/app/dashboard/events/[id]/actions";

type CheckInButtonProps = {
  rsvpId: string;
  checkedIn: boolean;
  canCheckIn?: boolean;
};

export function CheckInButton({ rsvpId, checkedIn, canCheckIn = true }: CheckInButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleAction(formData: FormData) {
    startTransition(async () => {
      await updateRsvpCheckInAction(formData);
      router.refresh();
    });
  }

  return (
    <form action={handleAction}>
      <input type="hidden" name="rsvpId" value={rsvpId} />
      <input type="hidden" name="checkedIn" value={checkedIn ? "false" : "true"} />
      <button
        type="submit"
        disabled={pending || (!canCheckIn && !checkedIn)}
        className={[
          "focus-ring rounded-full px-4 py-2 text-sm font-black transition hover:-translate-y-0.5",
          !canCheckIn && !checkedIn
            ? "bg-[color:var(--card)] text-[color:var(--muted)]"
            : checkedIn
            ? "bg-lime-mute text-zinc-950"
            : "bg-[color:var(--card)] text-[color:var(--foreground)]",
        ].join(" ")}
      >
        {pending ? "Updating" : checkedIn ? "Checked in" : canCheckIn ? "Check in" : "Not approved"}
      </button>
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { checkInRsvpByIdAction } from "@/app/dashboard/events/[id]/actions";

type QrCheckInButtonProps = {
  rsvpId: string;
  checkedIn: boolean;
  canCheckIn?: boolean;
};

export function QrCheckInButton({ rsvpId, checkedIn, canCheckIn = true }: QrCheckInButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleAction(formData: FormData) {
    startTransition(async () => {
      await checkInRsvpByIdAction(formData);
      router.refresh();
    });
  }

  return (
    <form action={handleAction}>
      <input type="hidden" name="rsvpId" value={rsvpId} />
      <button
        type="submit"
        disabled={checkedIn || pending || !canCheckIn}
        className={[
          "focus-ring rounded-full px-4 py-2 text-sm font-black disabled:opacity-55",
          canCheckIn ? "bg-lime-mute text-zinc-950" : "bg-[color:var(--card)] text-[color:var(--muted)]",
        ].join(" ")}
      >
        {pending ? "Checking in" : checkedIn ? "Already in" : canCheckIn ? "Check in" : "Not approved"}
      </button>
    </form>
  );
}

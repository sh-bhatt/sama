"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { checkInRsvpByIdAction } from "@/app/dashboard/events/[id]/actions";

type QrCheckInButtonProps = {
  rsvpId: string;
  checkedIn: boolean;
};

export function QrCheckInButton({ rsvpId, checkedIn }: QrCheckInButtonProps) {
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
        disabled={checkedIn || pending}
        className="focus-ring rounded-full bg-lime-mute px-4 py-2 text-sm font-black text-zinc-950 disabled:opacity-55"
      >
        {pending ? "Checking in" : checkedIn ? "Already in" : "Check in"}
      </button>
    </form>
  );
}

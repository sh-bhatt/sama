"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { approveNextWaitlistedGuestAction } from "@/app/dashboard/events/[id]/actions";

export function ApproveNextWaitlistButton({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleAction(formData: FormData) {
    startTransition(async () => {
      await approveNextWaitlistedGuestAction(formData);
      router.refresh();
    });
  }

  return (
    <form action={handleAction}>
      <input type="hidden" name="eventId" value={eventId} />
      <button
        type="submit"
        disabled={pending}
        className="focus-ring theme-action rounded-full px-5 py-3 text-sm font-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Approving..." : "Approve next waitlisted guest"}
      </button>
    </form>
  );
}

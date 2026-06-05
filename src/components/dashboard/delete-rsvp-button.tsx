"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteRsvpAction } from "@/app/dashboard/events/[id]/actions";

type DeleteRsvpButtonProps = {
  rsvpId: string;
};

export function DeleteRsvpButton({ rsvpId }: DeleteRsvpButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleAction(formData: FormData) {
    startTransition(async () => {
      await deleteRsvpAction(formData);
      router.refresh();
    });
  }

  return (
    <form action={handleAction}>
      <input type="hidden" name="rsvpId" value={rsvpId} />
      <button
        type="submit"
        disabled={pending}
        className="focus-ring rounded-full bg-rose-neon/15 px-4 py-2 text-sm font-black text-rose-neon disabled:opacity-60"
      >
        {pending ? "Removing" : "Remove"}
      </button>
    </form>
  );
}

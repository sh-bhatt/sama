"use client";

import type { PaymentStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { updateRsvpPaymentStatusAction } from "@/app/dashboard/events/[id]/actions";

type PaymentStatusControlProps = {
  rsvpId: string;
  paymentStatus: PaymentStatus;
};

const statuses: PaymentStatus[] = ["NOT_REQUIRED", "PENDING", "PAID"];

export function PaymentStatusControl({
  rsvpId,
  paymentStatus,
}: PaymentStatusControlProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleAction(formData: FormData) {
    startTransition(async () => {
      await updateRsvpPaymentStatusAction(formData);
      router.refresh();
    });
  }

  return (
    <form action={handleAction} className="flex flex-wrap gap-2">
      <input type="hidden" name="rsvpId" value={rsvpId} />
      {statuses.map((status) => (
        <button
          key={status}
          type="submit"
          name="paymentStatus"
          value={status}
          disabled={pending}
          className={[
            "focus-ring rounded-full px-3 py-1.5 text-xs font-black transition hover:-translate-y-0.5",
            paymentStatus === status
              ? "bg-lime-mute text-zinc-950"
              : "bg-black/35 text-[color:var(--foreground)]",
          ].join(" ")}
        >
          {status.toLowerCase().replace("_", " ")}
        </button>
      ))}
    </form>
  );
}

import type { PaymentStatus, RSVPStatus } from "@prisma/client";
import Link from "next/link";
import { deleteRsvpAction } from "@/app/dashboard/events/[id]/actions";
import { formatEventDateShort } from "@/lib/date";
import { CheckInButton } from "@/components/dashboard/check-in-button";
import { PaymentStatusControl } from "@/components/dashboard/payment-status-control";
import { RsvpStatusBadge } from "@/components/dashboard/rsvp-status-badge";

type Guest = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: RSVPStatus;
  plusOne: boolean;
  note: string | null;
  paymentStatus: PaymentStatus;
  checkedIn: boolean;
  createdAt: Date;
};

type GuestListProps = {
  guests: Guest[];
  inviteUrl: string;
  checkInBaseUrl: string;
};

export function GuestList({ guests, inviteUrl, checkInBaseUrl }: GuestListProps) {
  if (!guests.length) {
    return (
      <section className="theme-panel rounded-[2rem] border p-5 sm:p-6">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
          guest list
        </p>
        <h2 className="theme-heading mt-3 text-4xl font-black lowercase">no rsvps yet</h2>
        <p className="theme-muted mt-3 font-semibold leading-7">
          Share the invite link and the first replies will land here.
        </p>
        <p className="theme-muted mt-4 break-all rounded-2xl bg-black/35 px-4 py-3 text-sm font-semibold">
          {inviteUrl}
        </p>
      </section>
    );
  }

  return (
    <section className="theme-panel rounded-[2rem] border p-5 sm:p-6">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
        guest list
      </p>
      <div className="mt-5 grid gap-4">
        {guests.map((guest) => (
          <article key={guest.id} className="rounded-[1.5rem] bg-black/35 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-black text-white">{guest.name}</h3>
                  <RsvpStatusBadge status={guest.status} />
                  {guest.plusOne && (
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white">
                      +1
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm font-semibold text-zinc-400">
                  {guest.email || "no email"} - {guest.phone || "no phone"} -{" "}
                  {formatEventDateShort(guest.createdAt)}
                </p>
                {guest.note && (
                  <p className="mt-3 rounded-2xl bg-white/8 px-4 py-3 text-sm font-bold text-zinc-300">
                    {guest.note}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <CheckInButton rsvpId={guest.id} checkedIn={guest.checkedIn} />
                <form action={deleteRsvpAction}>
                  <input type="hidden" name="rsvpId" value={guest.id} />
                  <button
                    type="submit"
                    className="focus-ring rounded-full bg-rose-neon/15 px-4 py-2 text-sm font-black text-rose-neon"
                  >
                    Remove
                  </button>
                </form>
                <Link
                  href={`${checkInBaseUrl}?rsvpId=${guest.id}`}
                  className="focus-ring rounded-full bg-[color:var(--card)] px-4 py-2 text-sm font-black text-[color:var(--foreground)]"
                >
                  Check-in QR
                </Link>
              </div>
            </div>
            <div className="mt-4">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
                payment status
              </p>
              <PaymentStatusControl
                rsvpId={guest.id}
                paymentStatus={guest.paymentStatus}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

import type { ApprovalStatus, PaymentStatus, RSVPStatus } from "@prisma/client";
import Link from "next/link";
import { formatEventDateShort } from "@/lib/date";
import { ApprovalStatusBadge } from "@/components/dashboard/approval-status-badge";
import { ApprovalStatusControl } from "@/components/dashboard/approval-status-control";
import { CheckInButton } from "@/components/dashboard/check-in-button";
import { DeleteRsvpButton } from "@/components/dashboard/delete-rsvp-button";
import { PaymentStatusControl } from "@/components/dashboard/payment-status-control";
import { RsvpStatusBadge } from "@/components/dashboard/rsvp-status-badge";

type Guest = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: RSVPStatus;
  approvalStatus: ApprovalStatus;
  plusOne: boolean;
  note: string | null;
  paymentStatus: PaymentStatus;
  checkedIn: boolean;
  createdAt: Date;
  answers?: {
    id: string;
    answer: string;
    question: {
      id: string;
      question: string;
    };
  }[];
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
                  <ApprovalStatusBadge status={guest.approvalStatus} />
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
                {guest.answers && guest.answers.length > 0 && (
                  <details className="mt-3 rounded-2xl bg-white/8 px-4 py-3">
                    <summary className="cursor-pointer text-sm font-black text-lime-mute">
                      RSVP answers
                    </summary>
                    <div className="mt-3 space-y-3">
                      {guest.answers.map((item) => (
                        <div key={item.id}>
                          <p className="text-xs font-black uppercase tracking-[0.12em] text-zinc-500">
                            {item.question.question}
                          </p>
                          <p className="mt-1 text-sm font-bold text-zinc-300">{item.answer}</p>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <CheckInButton
                  rsvpId={guest.id}
                  checkedIn={guest.checkedIn}
                  canCheckIn={guest.approvalStatus === "APPROVED"}
                />
                <DeleteRsvpButton rsvpId={guest.id} />
                <Link
                  href={`${checkInBaseUrl}?rsvpId=${guest.id}`}
                  className="focus-ring rounded-full bg-[color:var(--card)] px-4 py-2 text-sm font-black text-[color:var(--foreground)]"
                >
                  Check-in QR
                </Link>
              </div>
            </div>
            <div className="mt-4">
              {guest.approvalStatus !== "APPROVED" && (
                <p className="mb-3 rounded-2xl bg-saffron-200/12 px-4 py-3 text-sm font-black text-saffron-200">
                  This guest is not approved for check-in yet.
                </p>
              )}
              <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
                approval status
              </p>
              <ApprovalStatusControl
                rsvpId={guest.id}
                approvalStatus={guest.approvalStatus}
              />
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

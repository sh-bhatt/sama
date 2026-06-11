"use client";

import type { ApprovalStatus, PaymentStatus, RSVPStatus } from "@prisma/client";
import Link from "next/link";
import { useMemo, useState } from "react";
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

type FilterKey = "ALL" | "GOING" | "MAYBE" | "PENDING" | "APPROVED" | "WAITLISTED" | "CHECKED_IN";

const filters: { key: FilterKey; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "GOING", label: "Going" },
  { key: "MAYBE", label: "Maybe" },
  { key: "PENDING", label: "Pending" },
  { key: "APPROVED", label: "Approved" },
  { key: "WAITLISTED", label: "Waitlisted" },
  { key: "CHECKED_IN", label: "Checked in" },
];

function matchesFilter(guest: Guest, filter: FilterKey) {
  if (filter === "ALL") {
    return true;
  }

  if (filter === "CHECKED_IN") {
    return guest.checkedIn;
  }

  if (filter === "GOING" || filter === "MAYBE") {
    return guest.status === filter;
  }

  return guest.approvalStatus === filter;
}

function contactLabel(guest: Guest) {
  return guest.email || guest.phone || "no contact added";
}

function statusCount(guests: Guest[], predicate: (guest: Guest) => boolean) {
  return guests.filter(predicate).length;
}

export function GuestList({ guests, inviteUrl, checkInBaseUrl }: GuestListProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const normalizedQuery = query.trim().toLowerCase();
  const summary = useMemo(
    () => [
      { label: "total", value: guests.length },
      { label: "going", value: statusCount(guests, (guest) => guest.status === "GOING") },
      { label: "maybe", value: statusCount(guests, (guest) => guest.status === "MAYBE") },
      { label: "pending", value: statusCount(guests, (guest) => guest.approvalStatus === "PENDING") },
      { label: "waitlisted", value: statusCount(guests, (guest) => guest.approvalStatus === "WAITLISTED") },
      { label: "checked-in", value: statusCount(guests, (guest) => guest.checkedIn) },
    ],
    [guests],
  );
  const visibleGuests = useMemo(
    () =>
      guests.filter((guest) => {
        const haystack = [guest.name, guest.email, guest.phone].filter(Boolean).join(" ").toLowerCase();
        return matchesFilter(guest, filter) && (!normalizedQuery || haystack.includes(normalizedQuery));
      }),
    [filter, guests, normalizedQuery],
  );

  if (!guests.length) {
    return (
      <section className="theme-panel rounded-[2rem] border p-5 sm:p-6">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
          guest list
        </p>
        <h2 className="theme-heading mt-3 text-4xl font-black lowercase">no guests yet</h2>
        <p className="theme-muted mt-3 font-semibold leading-7">
          Share your invite link to start the list.
        </p>
        <p className="theme-muted mt-4 break-all rounded-2xl bg-black/35 px-4 py-3 text-sm font-semibold">
          {inviteUrl}
        </p>
      </section>
    );
  }

  return (
    <section className="theme-panel rounded-[2rem] border p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
            guest list
          </p>
          <h2 className="theme-heading mt-2 text-4xl font-black lowercase">host view</h2>
        </div>
        <p className="theme-muted text-sm font-semibold">{visibleGuests.length} shown</p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {summary.map((item) => (
          <div key={item.label} className="rounded-2xl bg-black/35 px-4 py-3">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-zinc-500">{item.label}</p>
            <p className="mt-1 text-2xl font-black text-white">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3">
        <label>
          <span className="theme-muted text-sm font-black">Search guests</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="focus-ring mt-2 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3 font-bold text-[color:var(--foreground)] placeholder:text-[color:var(--muted)]"
            placeholder="Name, email, or phone"
          />
        </label>
        <div className="scroll-row flex gap-2 overflow-x-auto pb-1">
          {filters.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={[
                "focus-ring shrink-0 rounded-full px-4 py-2 text-sm font-black transition hover:-translate-y-0.5",
                filter === item.key
                  ? "bg-lime-mute text-zinc-950"
                  : "bg-black/35 text-[color:var(--foreground)]",
              ].join(" ")}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {visibleGuests.length ? (
          visibleGuests.map((guest) => (
            <article key={guest.id} className="rounded-[1.5rem] bg-black/35 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-black text-white">{guest.name}</h3>
                    <RsvpStatusBadge status={guest.status} />
                    <ApprovalStatusBadge status={guest.approvalStatus} />
                    {guest.checkedIn && (
                      <span className="rounded-full bg-lime-mute px-3 py-1 text-xs font-black text-zinc-950">
                        checked in
                      </span>
                    )}
                    {guest.plusOne && (
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white">
                        +1
                      </span>
                    )}
                    {guest.paymentStatus !== "NOT_REQUIRED" && (
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white">
                        payment {guest.paymentStatus.toLowerCase()}
                      </span>
                    )}
                    {guest.answers && guest.answers.length > 0 && (
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white">
                        {guest.answers.length} answers
                      </span>
                    )}
                  </div>
                  <p className="mt-2 truncate text-sm font-semibold text-zinc-400">{contactLabel(guest)}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <CheckInButton
                    rsvpId={guest.id}
                    checkedIn={guest.checkedIn}
                    canCheckIn={guest.approvalStatus === "APPROVED"}
                  />
                </div>
              </div>

              <details className="mt-4 rounded-2xl bg-white/8 px-4 py-3">
                <summary className="cursor-pointer text-sm font-black text-lime-mute">
                  More details
                </summary>
                <div className="mt-4 space-y-4">
                  <div className="grid gap-2 text-sm font-semibold text-zinc-300 sm:grid-cols-3">
                    <p className="break-words rounded-2xl bg-black/30 px-3 py-2">
                      <span className="block text-xs font-black uppercase tracking-[0.12em] text-zinc-500">email</span>
                      {guest.email || "no email"}
                    </p>
                    <p className="break-words rounded-2xl bg-black/30 px-3 py-2">
                      <span className="block text-xs font-black uppercase tracking-[0.12em] text-zinc-500">phone</span>
                      {guest.phone || "no phone"}
                    </p>
                    <p className="rounded-2xl bg-black/30 px-3 py-2">
                      <span className="block text-xs font-black uppercase tracking-[0.12em] text-zinc-500">created</span>
                      {formatEventDateShort(guest.createdAt)}
                    </p>
                  </div>

                  {guest.note && (
                    <p className="rounded-2xl bg-black/30 px-4 py-3 text-sm font-bold text-zinc-300">
                      {guest.note}
                    </p>
                  )}

                  {guest.answers && guest.answers.length > 0 && (
                    <div className="rounded-2xl bg-black/30 px-4 py-3">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-zinc-500">RSVP answers</p>
                      <div className="mt-3 space-y-3">
                        {guest.answers.map((item) => (
                          <div key={item.id}>
                            <p className="text-xs font-black uppercase tracking-[0.12em] text-zinc-500">
                              {item.question.question}
                            </p>
                            <p className="mt-1 break-words text-sm font-bold text-zinc-300">{item.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {guest.approvalStatus !== "APPROVED" && (
                    <p className="rounded-2xl bg-saffron-200/12 px-4 py-3 text-sm font-black text-saffron-200">
                      This guest is not approved for check-in yet.
                    </p>
                  )}

                  <div>
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
                      approval status
                    </p>
                    <ApprovalStatusControl rsvpId={guest.id} approvalStatus={guest.approvalStatus} />
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
                      payment status
                    </p>
                    <PaymentStatusControl rsvpId={guest.id} paymentStatus={guest.paymentStatus} />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`${checkInBaseUrl}?rsvpId=${guest.id}`}
                      className="focus-ring rounded-full bg-[color:var(--card)] px-4 py-2 text-sm font-black text-[color:var(--foreground)]"
                    >
                      Check-in QR
                    </Link>
                    <DeleteRsvpButton rsvpId={guest.id} />
                  </div>
                </div>
              </details>
            </article>
          ))
        ) : (
          <div className="rounded-[1.5rem] bg-black/35 p-5">
            <h3 className="theme-heading text-2xl font-black lowercase">no matching guests</h3>
            <p className="theme-muted mt-2 font-semibold">Try another search or filter.</p>
          </div>
        )}
      </div>
    </section>
  );
}

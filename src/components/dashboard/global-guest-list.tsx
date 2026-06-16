"use client";

import type { ApprovalStatus, PaymentStatus, RSVPStatus } from "@prisma/client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ApprovalStatusBadge } from "@/components/dashboard/approval-status-badge";
import { RsvpStatusBadge } from "@/components/dashboard/rsvp-status-badge";
import { formatDateTimeLabel, formatEventDateShort } from "@/lib/date";

type GlobalGuest = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: RSVPStatus;
  approvalStatus: ApprovalStatus;
  paymentStatus: PaymentStatus;
  checkedIn: boolean;
  plusOne: boolean;
  note: string | null;
  createdAt: Date;
  event: {
    id: string;
    title: string;
    slug: string;
    eventDate: Date;
    eventTime: string;
  };
  answers: {
    id: string;
    answer: string;
    question: {
      id: string;
      question: string;
    };
  }[];
};

type GlobalGuestListProps = {
  guests: GlobalGuest[];
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

function matchesFilter(guest: GlobalGuest, filter: FilterKey) {
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

function statusCount(guests: GlobalGuest[], predicate: (guest: GlobalGuest) => boolean) {
  return guests.filter(predicate).length;
}

function contactLabel(guest: GlobalGuest) {
  return guest.email || guest.phone || "contact hidden until opened";
}

export function GlobalGuestList({ guests }: GlobalGuestListProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const normalizedQuery = query.trim().toLowerCase();
  const summary = useMemo(
    () => [
      { label: "total guests", value: guests.length },
      { label: "going", value: statusCount(guests, (guest) => guest.status === "GOING") },
      { label: "pending approvals", value: statusCount(guests, (guest) => guest.approvalStatus === "PENDING") },
      { label: "waitlisted", value: statusCount(guests, (guest) => guest.approvalStatus === "WAITLISTED") },
      { label: "checked in", value: statusCount(guests, (guest) => guest.checkedIn) },
    ],
    [guests],
  );
  const visibleGuests = useMemo(
    () =>
      guests.filter((guest) => {
        const haystack = [
          guest.name,
          guest.email,
          guest.phone,
          guest.event.title,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return matchesFilter(guest, filter) && (!normalizedQuery || haystack.includes(normalizedQuery));
      }),
    [filter, guests, normalizedQuery],
  );

  if (!guests.length) {
    return (
      <section className="theme-panel rounded-[2rem] border p-6 sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
          empty room
        </p>
        <h2 className="theme-heading mt-3 text-4xl font-black lowercase">
          no guests across your rooms yet.
        </h2>
        <p className="theme-muted mt-3 max-w-2xl font-semibold leading-7">
          Share an invite to start the list. Every RSVP across your hosted events will collect here.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/dashboard/invite-tools" className="focus-ring theme-action rounded-full px-5 py-3 font-black">
            Share an invite
          </Link>
          <Link href="/dashboard/events/new" className="focus-ring rounded-full border border-[color:var(--border)] px-5 py-3 font-black text-[color:var(--foreground)]">
            Create invite
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-w-0 space-y-5">
      <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {summary.map((item) => (
          <article key={item.label} className="theme-panel rounded-[1.5rem] border p-4">
            <p className="theme-muted text-xs font-black uppercase tracking-[0.14em]">{item.label}</p>
            <p className="theme-heading mt-2 text-3xl font-black">{item.value}</p>
          </article>
        ))}
      </div>

      <section className="theme-panel rounded-[2rem] border p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
              all rooms
            </p>
            <h2 className="theme-heading mt-2 text-4xl font-black lowercase">guest roster</h2>
          </div>
          <p className="theme-muted text-sm font-semibold">{visibleGuests.length} shown</p>
        </div>

        <div className="mt-5 grid gap-3">
          <label>
            <span className="theme-muted text-sm font-black">Search guests</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="focus-ring mt-2 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3 font-bold text-[color:var(--foreground)] placeholder:text-[color:var(--muted)]"
              placeholder="Name, email, phone, or event"
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
                    : "border border-zinc-950/10 bg-white/58 text-[color:var(--foreground)]",
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
              <article key={guest.id} className="rounded-[1.5rem] border border-zinc-950/10 bg-white/58 p-4">
                <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-black text-zinc-950">{guest.name}</h3>
                      <RsvpStatusBadge status={guest.status} />
                      <ApprovalStatusBadge status={guest.approvalStatus} />
                      {guest.checkedIn && (
                        <span className="rounded-full bg-lime-mute px-3 py-1 text-xs font-black text-zinc-950">
                          checked in
                        </span>
                      )}
                      {guest.plusOne && (
                        <span className="rounded-full border border-zinc-950/10 bg-white/60 px-3 py-1 text-xs font-black text-zinc-950">
                          +1
                        </span>
                      )}
                    </div>
                    <p className="mt-2 truncate text-sm font-black text-lime-mute">{guest.event.title}</p>
                    <p className="mt-1 truncate text-sm font-semibold text-zinc-400">
                      {formatDateTimeLabel(guest.event.eventDate, guest.event.eventTime)}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/events/${guest.event.id}`}
                    className="focus-ring shrink-0 rounded-full bg-[color:var(--card)] px-4 py-2 text-sm font-black text-[color:var(--foreground)] transition hover:-translate-y-0.5"
                  >
                    Manage event
                  </Link>
                </div>

                <details className="mt-4 rounded-2xl border border-zinc-950/10 bg-white/58 px-4 py-3">
                  <summary className="cursor-pointer text-sm font-black text-lime-mute">
                    Contact, notes, and answers
                  </summary>
                  <div className="mt-4 space-y-4">
                    <div className="grid gap-2 text-sm font-semibold text-zinc-700 sm:grid-cols-2 lg:grid-cols-4">
                      <p className="break-words rounded-2xl border border-zinc-950/10 bg-white/52 px-3 py-2">
                        <span className="block text-xs font-black uppercase tracking-[0.12em] text-zinc-500">email</span>
                        {guest.email || "no email"}
                      </p>
                      <p className="break-words rounded-2xl border border-zinc-950/10 bg-white/52 px-3 py-2">
                        <span className="block text-xs font-black uppercase tracking-[0.12em] text-zinc-500">phone</span>
                        {guest.phone || "no phone"}
                      </p>
                      <p className="rounded-2xl border border-zinc-950/10 bg-white/52 px-3 py-2">
                        <span className="block text-xs font-black uppercase tracking-[0.12em] text-zinc-500">created</span>
                        {formatEventDateShort(guest.createdAt)}
                      </p>
                      <p className="rounded-2xl border border-zinc-950/10 bg-white/52 px-3 py-2">
                        <span className="block text-xs font-black uppercase tracking-[0.12em] text-zinc-500">payment</span>
                        {guest.paymentStatus.toLowerCase().replace("_", " ")}
                      </p>
                    </div>

                    <p className="rounded-2xl border border-zinc-950/10 bg-white/52 px-4 py-3 text-sm font-bold text-zinc-700">
                      {contactLabel(guest)}
                    </p>

                    {guest.note && (
                      <p className="rounded-2xl border border-zinc-950/10 bg-white/52 px-4 py-3 text-sm font-bold text-zinc-700">
                        {guest.note}
                      </p>
                    )}

                    {guest.answers.length > 0 && (
                      <div className="rounded-2xl border border-zinc-950/10 bg-white/52 px-4 py-3">
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-zinc-500">RSVP answers</p>
                        <div className="mt-3 space-y-3">
                          {guest.answers.map((item) => (
                            <div key={item.id}>
                              <p className="text-xs font-black uppercase tracking-[0.12em] text-zinc-500">
                                {item.question.question}
                              </p>
                              <p className="mt-1 break-words text-sm font-bold text-zinc-700">{item.answer}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </details>
              </article>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-zinc-950/10 bg-white/58 p-5">
              <h3 className="theme-heading text-2xl font-black lowercase">no matching guests</h3>
              <p className="theme-muted mt-2 font-semibold">Try another search or filter.</p>
            </div>
          )}
        </div>
      </section>
    </section>
  );
}

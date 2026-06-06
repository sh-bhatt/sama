import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { ApprovalStatusBadge } from "@/components/dashboard/approval-status-badge";
import { QrCheckInButton } from "@/components/dashboard/qr-check-in-button";
import { QrCodeCard } from "@/components/qr/qr-code-card";
import { RealtimeRefresh } from "@/components/realtime/realtime-refresh";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { isClerkConfigured, isDatabaseConfigured } from "@/lib/auth/config";
import { formatEventDate } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { eventChannel } from "@/lib/realtime/events";

type CheckInPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; rsvpId?: string }>;
};

export const dynamic = "force-dynamic";

function SetupMessage({
  label,
  title,
  body,
}: {
  label: string;
  title: string;
  body: string;
}) {
  return (
    <main className="dark-stage min-h-screen overflow-x-hidden px-4 py-6 text-foreground sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="theme-panel rounded-[2rem] border p-6 sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">
            {label}
          </p>
          <h1 className="theme-heading mt-3 text-4xl font-black lowercase">{title}</h1>
          <p className="theme-muted mt-4 font-semibold leading-7">{body}</p>
          <Link href="/dashboard" className="focus-ring theme-action mt-6 inline-flex rounded-full px-5 py-3 font-black">
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

export default async function CheckInPage({ params, searchParams }: CheckInPageProps) {
  if (!isClerkConfigured()) {
    return (
      <SetupMessage
        label="Clerk setup needed"
        title="connect auth to check guests in"
        body="Add Clerk keys before opening the entrance console."
      />
    );
  }

  await auth.protect();

  if (!isDatabaseConfigured()) {
    return (
      <SetupMessage
        label="database setup needed"
        title="connect Neon to check guests in"
        body="Add DATABASE_URL, then run Prisma setup."
      />
    );
  }

  const { id } = await params;
  const { q = "", rsvpId } = await searchParams;
  const currentUser = await getCurrentUser();

  if (currentUser.status !== "ready" || !currentUser.dbUser) {
    return (
      <SetupMessage
        label="host profile unavailable"
        title="sync your host profile"
        body="Sama could not prepare your local host record."
      />
    );
  }

  const event = await prisma.event.findFirst({
    where: { id, hostId: currentUser.dbUser.id },
    include: {
      rsvps: {
        where: rsvpId
          ? { id: rsvpId }
          : q.trim()
            ? {
                OR: [
                  { name: { contains: q.trim(), mode: "insensitive" } },
                  { email: { contains: q.trim(), mode: "insensitive" } },
                  { phone: { contains: q.trim() } },
                ],
              }
            : undefined,
        orderBy: { createdAt: "desc" },
        take: rsvpId ? 1 : 24,
      },
    },
  });

  if (!event) {
    notFound();
  }

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") || "http";
  const origin = host ? `${protocol}://${host}` : "http://localhost:3000";

  return (
    <main className="dark-stage min-h-screen overflow-x-hidden text-foreground">
      <header className="border-b border-[color:var(--border)] bg-[color:var(--background)]/72 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-2xl font-black lowercase text-[color:var(--foreground)]">
            Sama
          </Link>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/events/${event.id}`} className="text-sm font-black text-lime-mute">
              Manage
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_23rem] lg:px-8">
        <div className="min-w-0 space-y-6">
          <section className="film-grain relative overflow-hidden rounded-[2.4rem] bg-[radial-gradient(circle_at_22%_14%,rgba(198,255,69,0.25),transparent_26%),linear-gradient(135deg,#111,#281326,#050505)] p-7 shadow-[0_24px_90px_rgba(0,0,0,0.48)] sm:p-10">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
              entrance console
            </p>
            <h1 className="mt-3 max-w-4xl text-5xl font-black lowercase leading-none text-white sm:text-7xl">
              check in {event.title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg font-semibold leading-8 text-zinc-300">
              {formatEventDate(event.eventDate)} - {event.eventTime} - {event.location}
            </p>
            <div className="mt-5">
              <RealtimeRefresh
                channels={[eventChannel(event.id)]}
                enabled={Boolean(process.env.ABLY_API_KEY)}
                label="check-in live"
              />
            </div>
          </section>

          <section className="theme-panel rounded-[2rem] border p-5 sm:p-6">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">
              find guest
            </p>
            <form className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                name="q"
                defaultValue={q}
                placeholder="Search name, email, or phone"
                className="focus-ring min-w-0 flex-1 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3 font-bold text-[color:var(--foreground)] placeholder:text-[color:var(--muted)]"
              />
              <button type="submit" className="focus-ring theme-action rounded-2xl px-5 py-3 font-black">
                Search
              </button>
            </form>
          </section>

          <section className="grid gap-4">
            {event.rsvps.length ? (
              event.rsvps.map((rsvp) => {
                const checkInUrl = `/dashboard/events/${event.id}/check-in?rsvpId=${rsvp.id}`;

                return (
                  <article key={rsvp.id} className="theme-panel rounded-[1.6rem] border p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="theme-heading text-2xl font-black">{rsvp.name}</h2>
                          <span className="rounded-full bg-black/35 px-3 py-1 text-xs font-black text-lime-mute">
                            {rsvp.status.toLowerCase().replace("_", " ")}
                          </span>
                          <ApprovalStatusBadge status={rsvp.approvalStatus} />
                          {rsvp.checkedIn && (
                            <span className="rounded-full bg-lime-mute px-3 py-1 text-xs font-black text-zinc-950">
                              checked in
                            </span>
                          )}
                        </div>
                        <p className="theme-muted mt-2 text-sm font-semibold">
                          {rsvp.email || "no email"} - {rsvp.phone || "no phone"}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <QrCheckInButton
                          rsvpId={rsvp.id}
                          checkedIn={rsvp.checkedIn}
                          canCheckIn={rsvp.approvalStatus === "APPROVED"}
                        />
                        <Link
                          href={checkInUrl}
                          className="focus-ring rounded-full bg-[color:var(--card)] px-4 py-2 text-sm font-black text-[color:var(--foreground)]"
                        >
                          QR link
                        </Link>
                      </div>
                    </div>
                    {rsvp.approvalStatus !== "APPROVED" && (
                      <p className="mt-4 rounded-2xl bg-saffron-200/12 px-4 py-3 text-sm font-black text-saffron-200">
                        This guest is not approved for check-in yet.
                      </p>
                    )}
                  </article>
                );
              })
            ) : (
              <div className="theme-panel rounded-[2rem] border p-6">
                <p className="theme-heading text-2xl font-black lowercase">no guests found</p>
                <p className="theme-muted mt-2 font-semibold">Try a different name, email, or phone.</p>
              </div>
            )}
          </section>
        </div>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-6 lg:self-start">
          {rsvpId && event.rsvps[0]?.approvalStatus === "APPROVED" ? (
            <QrCodeCard
              value={`${origin}/dashboard/events/${event.id}/check-in?rsvpId=${event.rsvps[0].id}`}
              title="Guest check-in QR"
              description={`Protected QR for ${event.rsvps[0].name}. Host sign-in is required.`}
            />
          ) : rsvpId && event.rsvps[0] ? (
            <section className="theme-panel rounded-[2rem] border p-5">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">
                check-in blocked
              </p>
              <p className="theme-muted mt-3 font-semibold leading-7">
                This guest is not approved for check-in yet.
              </p>
            </section>
          ) : (
            <section className="theme-panel rounded-[2rem] border p-5">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
                qr check-in
              </p>
              <p className="theme-muted mt-3 font-semibold leading-7">
                Open a guest result&apos;s QR link to generate a protected check-in QR.
              </p>
            </section>
          )}
          <Link
            href={`/dashboard/events/${event.id}`}
            className="focus-ring theme-action block rounded-full px-5 py-3 text-center font-black"
          >
            Back to manage event
          </Link>
        </aside>
      </section>
    </main>
  );
}

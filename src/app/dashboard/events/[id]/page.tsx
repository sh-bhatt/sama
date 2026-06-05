import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { AddToCalendar } from "@/components/calendar/add-to-calendar";
import { CopyLinkButton } from "@/components/copy-link-button";
import { DatePollCard } from "@/components/dashboard/date-poll-card";
import { DeleteEventButton } from "@/components/dashboard/delete-event-button";
import { EventActivityFeed } from "@/components/dashboard/event-activity-feed";
import { GuestList } from "@/components/dashboard/guest-list";
import { QrCodeCard } from "@/components/qr/qr-code-card";
import { RealtimeRefresh } from "@/components/realtime/realtime-refresh";
import { ShareWhatsAppButton } from "@/components/share-whatsapp-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { isClerkConfigured, isDatabaseConfigured } from "@/lib/auth/config";
import { createGoogleCalendarUrl } from "@/lib/calendar";
import { formatEventDate } from "@/lib/date";
import { createWhatsAppShareUrl } from "@/lib/whatsapp";
import { prisma } from "@/lib/prisma";
import { dashboardChannel, eventChannel } from "@/lib/realtime/events";

type ManageEventPageProps = {
  params: Promise<{ id: string }>;
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

export default async function ManageEventPage({ params }: ManageEventPageProps) {
  if (!isClerkConfigured()) {
    return (
      <SetupMessage
        label="Clerk setup needed"
        title="connect auth to manage invites"
        body="Add Clerk keys to your local environment before opening host tools."
      />
    );
  }

  await auth.protect();

  if (!isDatabaseConfigured()) {
    return (
      <SetupMessage
        label="database setup needed"
        title="connect Neon to manage invites"
        body="Add DATABASE_URL, then run npx prisma generate and npx prisma db push."
      />
    );
  }

  const { id } = await params;
  const currentUser = await getCurrentUser();

  if (currentUser.status !== "ready" || !currentUser.dbUser) {
    return (
      <SetupMessage
        label="host profile unavailable"
        title="sync your host profile"
        body="Clerk is active, but Sama could not prepare your local host record."
      />
    );
  }

  const event = await prisma.event.findFirst({
    where: { id, hostId: currentUser.dbUser.id },
    include: {
      rsvps: { orderBy: { createdAt: "desc" } },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 12,
      },
      datePolls: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          options: {
            orderBy: { optionDate: "asc" },
            include: { _count: { select: { votes: true } } },
          },
        },
      },
      _count: { select: { rsvps: true } },
    },
  });

  if (!event) {
    notFound();
  }

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") || "http";
  const origin = host ? `${protocol}://${host}` : "http://localhost:3000";
  const inviteUrl = `${origin}/invite/${event.slug}`;
  const checkInUrl = `${origin}/dashboard/events/${event.id}/check-in`;
  const whatsappUrl = createWhatsAppShareUrl(event.title, inviteUrl);
  const googleCalendarUrl = createGoogleCalendarUrl(event, inviteUrl);
  const icsUrl = `/api/events/${event.id}/calendar`;
  const goingCount = event.rsvps.filter((rsvp) => rsvp.status === "GOING").length;
  const maybeCount = event.rsvps.filter((rsvp) => rsvp.status === "MAYBE").length;
  const notGoingCount = event.rsvps.filter((rsvp) => rsvp.status === "NOT_GOING").length;
  const checkedInCount = event.rsvps.filter((rsvp) => rsvp.checkedIn).length;
  const paidCount = event.rsvps.filter((rsvp) => rsvp.paymentStatus === "PAID").length;
  const pendingCount = event.rsvps.filter((rsvp) => rsvp.paymentStatus === "PENDING").length;
  const poll = event.datePolls[0]
    ? {
        question: event.datePolls[0].question,
        options: event.datePolls[0].options.map((option) => ({
          id: option.id,
          optionDate: option.optionDate,
          label: option.label,
          votes: option._count.votes,
        })),
      }
    : null;

  return (
    <main className="dark-stage min-h-screen overflow-x-hidden text-foreground">
      <header className="border-b border-[color:var(--border)] bg-[color:var(--background)]/72 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-2xl font-black lowercase text-[color:var(--foreground)]">
            Sama
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-sm font-black text-lime-mute">
              Dashboard
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:px-8">
        <div className="min-w-0 space-y-6">
          <section className="film-grain relative overflow-hidden rounded-[2.4rem] bg-[radial-gradient(circle_at_22%_14%,rgba(255,46,139,0.42),transparent_28%),linear-gradient(135deg,#111,#281326,#050505)] p-7 shadow-[0_24px_90px_rgba(0,0,0,0.48)] sm:p-10">
            <div className="relative">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
                manage invite
              </p>
              <h1 className="mt-3 max-w-4xl text-5xl font-black lowercase leading-none text-white sm:text-7xl">
                {event.title}
              </h1>
              <p className="mt-4 max-w-2xl text-lg font-semibold leading-8 text-zinc-300">
                {event.description || "A Sama room is ready for your people."}
              </p>
              <div className="mt-5">
                <RealtimeRefresh
                  channels={[
                    eventChannel(event.id),
                    dashboardChannel(currentUser.dbUser.id),
                  ]}
                  enabled={Boolean(process.env.ABLY_API_KEY)}
                  label="room live"
                />
              </div>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-3">
            {[
              ["date", formatEventDate(event.eventDate)],
              ["time", event.eventTime],
              ["place", event.location],
            ].map(([label, value]) => (
              <article key={label} className="theme-panel rounded-[1.5rem] border p-5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-lime-mute">{label}</p>
                <h2 className="theme-heading mt-2 text-xl font-black">{value}</h2>
              </article>
            ))}
          </section>

          <section className="theme-panel rounded-[2rem] border p-5 sm:p-6">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">
              room details
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["city", event.city || "Not set"],
                ["category", event.category || "Not set"],
                ["theme", event.theme],
                ["visibility", event.visibility],
                ["capacity", event.capacity ? String(event.capacity) : "Open"],
                ["plus one", event.allowPlusOne ? "Allowed" : "Off"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-black/35 px-4 py-3">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[color:var(--muted)]">
                    {label}
                  </p>
                  <p className="theme-heading mt-1 font-black">{value}</p>
                </div>
              ))}
            </div>
            {(event.upiId || event.paymentNote) && (
              <div className="mt-4 rounded-2xl bg-lime-mute p-4 text-zinc-950">
                <p className="text-xs font-black uppercase tracking-[0.14em]">contribution</p>
                <p className="mt-2 font-black">{event.paymentNote || "Payment details added"}</p>
                {event.upiId && <p className="mt-1 text-sm font-bold">UPI: {event.upiId}</p>}
              </div>
            )}
          </section>

          <section className="theme-panel rounded-[2rem] border p-5 sm:p-6">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
              rsvp summary
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Going", goingCount],
                ["Maybe", maybeCount],
                ["Can't go", notGoingCount],
                ["Checked in", checkedInCount],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-black/35 px-4 py-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-zinc-500">{label}</p>
                  <p className="mt-2 text-3xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>
            {(event.upiId || event.paymentNote) && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-lime-mute px-4 py-4 text-zinc-950">
                  <p className="text-xs font-black uppercase tracking-[0.14em]">paid</p>
                  <p className="mt-2 text-3xl font-black">{paidCount}</p>
                </div>
                <div className="rounded-2xl bg-saffron-200 px-4 py-4 text-zinc-950">
                  <p className="text-xs font-black uppercase tracking-[0.14em]">pending</p>
                  <p className="mt-2 text-3xl font-black">{pendingCount}</p>
                </div>
              </div>
            )}
          </section>

          <DatePollCard eventId={event.id} poll={poll} />

          <GuestList guests={event.rsvps} inviteUrl={inviteUrl} checkInBaseUrl={checkInUrl} />
        </div>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-6 lg:self-start">
          <QrCodeCard
            value={inviteUrl}
            title="Scan to open invite"
            description="Public QR for the guest invite link."
          />

          <AddToCalendar googleUrl={googleCalendarUrl} icsUrl={icsUrl} />

          <section className="theme-panel rounded-[2rem] border p-5">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
              invite link
            </p>
            <p className="theme-muted mt-3 break-all text-sm font-semibold">{inviteUrl}</p>
            <div className="mt-4 flex flex-col gap-2">
              <CopyLinkButton value={inviteUrl} />
              <ShareWhatsAppButton href={whatsappUrl} />
              <Link
                href={`/invite/${event.slug}`}
                className="focus-ring rounded-full bg-[color:var(--card)] px-4 py-2 text-center text-sm font-black text-[color:var(--foreground)] transition hover:-translate-y-0.5"
              >
                Open public invite
              </Link>
              <Link
                href={`/dashboard/events/${event.id}/check-in`}
                className="focus-ring rounded-full bg-[color:var(--card)] px-4 py-2 text-center text-sm font-black text-[color:var(--foreground)] transition hover:-translate-y-0.5"
              >
                QR check-in
              </Link>
            </div>
          </section>

          <EventActivityFeed activities={event.activities} />

          <DeleteEventButton eventId={event.id} />
        </aside>
      </section>
    </main>
  );
}

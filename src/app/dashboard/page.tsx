import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { CopyLinkButton } from "@/components/copy-link-button";
import { HostChecklist } from "@/components/dashboard/host-checklist";
import { MomentumCard } from "@/components/dashboard/momentum-card";
import { PulseCard } from "@/components/dashboard/pulse-card";
import { RecentRsvps } from "@/components/dashboard/recent-rsvps";
import { EventCard } from "@/components/discovery/event-card";
import { AnimatedInviteCard } from "@/components/invite/animated-invite-card";
import { ProfileCompletionCard } from "@/components/profile/profile-completion-card";
import { RealtimeRefresh } from "@/components/realtime/realtime-refresh";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { isClerkConfigured } from "@/lib/auth/config";
import { formatDateTimeLabel } from "@/lib/date";
import { dashboardStats, demoEvent, hostEvents, recentActivity } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import { dashboardChannel } from "@/lib/realtime/events";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!isClerkConfigured()) {
    return (
      <main className="dark-stage min-h-screen overflow-x-hidden px-4 py-6 text-foreground sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="theme-panel rounded-[2rem] border p-6 sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
              Clerk setup needed
            </p>
            <h1 className="theme-heading mt-3 text-4xl font-black lowercase">
              connect auth to open the dashboard
            </h1>
            <p className="theme-muted mt-4 font-semibold leading-7">
              Add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY to
              your local environment. Public pages still work without them.
            </p>
            <Link
              href="/"
              className="focus-ring theme-action mt-6 inline-flex rounded-full px-5 py-3 font-black"
            >
              Back to discovery
            </Link>
          </div>
        </div>
      </main>
    );
  }

  await auth.protect();

  const userResult = await getCurrentUser();
  const primaryEmail =
    userResult.clerkUser?.emailAddresses.find(
      (email) => email.id === userResult.clerkUser?.primaryEmailAddressId,
    )?.emailAddress ??
    userResult.clerkUser?.emailAddresses[0]?.emailAddress ??
    null;
  const displayName =
    userResult.dbUser?.name ||
    userResult.clerkUser?.firstName ||
    primaryEmail?.split("@")[0] ||
    "host";
  const dbUser = userResult.status === "ready" ? userResult.dbUser : null;
  const dashboardData =
    dbUser
      ? await (async () => {
          try {
            const [events, rsvpGroups, latestActivity] = await Promise.all([
              prisma.event.findMany({
                where: { hostId: dbUser.id },
                orderBy: [{ eventDate: "asc" }, { createdAt: "desc" }],
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  eventDate: true,
                  eventTime: true,
                  location: true,
                  city: true,
                  category: true,
                  theme: true,
                  visibility: true,
                  capacity: true,
                  requiresApproval: true,
                  waitlistEnabled: true,
                  datePolls: { select: { id: true }, take: 1 },
                  _count: { select: { rsvps: true, memoryPhotos: true } },
                },
              }),
              prisma.rSVP.groupBy({
                by: ["eventId", "approvalStatus", "checkedIn"],
                where: { event: { hostId: dbUser.id } },
                _count: { _all: true },
              }),
              prisma.eventActivity.findMany({
                where: { event: { hostId: dbUser.id } },
                orderBy: { createdAt: "desc" },
                take: 5,
                select: {
                  id: true,
                  message: true,
                  createdAt: true,
                  event: { select: { title: true } },
                },
              }),
            ]);

            return { status: "ready" as const, events, rsvpGroups, latestActivity };
          } catch (error) {
            console.warn("Dashboard data load failed:", error);
            return { status: "database-error" as const, events: [], rsvpGroups: [], latestActivity: [] };
          }
        })()
      : { status: "idle" as const, events: [], rsvpGroups: [], latestActivity: [] };
  const realEvents = dashboardData.events;
  const rsvpCountFor = (eventId: string, predicate: (group: (typeof dashboardData.rsvpGroups)[number]) => boolean) =>
    dashboardData.rsvpGroups
      .filter((group) => group.eventId === eventId && predicate(group))
      .reduce((total, group) => total + group._count._all, 0);
  const totalRsvps = realEvents.reduce((total, event) => total + event._count.rsvps, 0);
  const approvedGuests = dashboardData.rsvpGroups
    .filter((group) => group.approvalStatus === "APPROVED")
    .reduce((total, group) => total + group._count._all, 0);
  const pendingApprovals = dashboardData.rsvpGroups
    .filter((group) => group.approvalStatus === "PENDING")
    .reduce((total, group) => total + group._count._all, 0);
  const checkedInGuests = dashboardData.rsvpGroups
    .filter((group) => group.checkedIn)
    .reduce((total, group) => total + group._count._all, 0);
  const latestActivity = dashboardData.latestActivity.map((activity) => ({
    id: activity.id,
    message: activity.message,
    eventTitle: activity.event.title,
  }));
  const realStats =
    userResult.status === "ready"
      ? [
          { label: "live events", value: String(realEvents.length), detail: "saved invites" },
          {
            label: "total RSVPs",
            value: String(totalRsvps),
            detail: "all guest replies",
          },
          {
            label: "approved",
            value: String(approvedGuests),
            detail: "cleared guests",
          },
          { label: "pending", value: String(pendingApprovals), detail: "need host approval" },
          { label: "check-ins", value: String(checkedInGuests), detail: "guests at the room" },
        ]
      : dashboardStats;
  const headerList = await headers();
  const origin =
    headerList.get("x-forwarded-host") || headerList.get("host")
      ? `${headerList.get("x-forwarded-proto") || "http"}://${headerList.get("x-forwarded-host") || headerList.get("host")}`
      : "http://localhost:3000";
  const dashboardRealtimeChannel =
    userResult.status === "ready" && userResult.dbUser
      ? dashboardChannel(userResult.dbUser.id)
      : null;
  const profileIncomplete = Boolean(
    userResult.status === "ready" &&
      userResult.dbUser &&
      (!userResult.dbUser.username || !userResult.dbUser.bio),
  );

  return (
    <main className="dark-stage min-h-screen overflow-x-hidden text-foreground">
      <header className="border-b border-[color:var(--border)] bg-[color:var(--background)]/72 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="min-w-0 text-2xl font-black lowercase text-[color:var(--foreground)]">Sama</Link>
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/discover" className="hidden text-sm font-black text-lime-mute sm:inline-flex">
              Discover
            </Link>
            <Link href="/dashboard/profile" className="hidden text-sm font-black text-lime-mute sm:inline-flex">
              Profile
            </Link>
            <Link href="/dashboard/events/new" className="focus-ring theme-action rounded-full px-4 py-2 text-sm font-black">
              Create event
            </Link>
            <UserButton />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="film-grain relative overflow-hidden rounded-[2.4rem] bg-[radial-gradient(circle_at_20%_10%,rgba(255,46,139,0.38),transparent_25%),linear-gradient(135deg,#111,#281326,#050505)] p-7 shadow-[0_24px_90px_rgba(0,0,0,0.48)] sm:p-10">
          <div className="relative">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
              your events, your crowd, your city
            </p>
            <h1 className="mt-3 max-w-4xl text-5xl font-black lowercase leading-none text-white sm:text-7xl">
              good evening, {displayName}.
            </h1>
            <p className="mt-4 max-w-2xl text-lg font-semibold leading-8 text-zinc-300">
              Host the room, send the link, watch the guest list wake up.
            </p>
            {dashboardRealtimeChannel && (
              <div className="mt-5">
                <RealtimeRefresh
                  channels={[dashboardRealtimeChannel]}
                  enabled={Boolean(process.env.ABLY_API_KEY)}
                  label="dashboard live"
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {realStats.map((stat) => (
            <article key={stat.label} className="theme-panel min-w-0 rounded-[1.5rem] border p-5">
              <p className="theme-muted text-sm font-black uppercase tracking-[0.14em]">{stat.label}</p>
              <p className="theme-heading mt-3 text-4xl font-black">{stat.value}</p>
              <p className="mt-2 text-sm font-bold text-lime-mute">{stat.detail}</p>
            </article>
          ))}
        </div>

        {userResult.status === "database-not-configured" && (
          <section className="theme-panel rounded-[1.5rem] border p-5">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">
              database setup pending
            </p>
            <p className="theme-muted mt-2 font-semibold leading-7">
              Add DATABASE_URL for Neon, then run Prisma generate and db push.
              The dashboard stays static until Phase 2B connects real events.
            </p>
          </section>
        )}

        {(userResult.status === "database-error" || dashboardData.status === "database-error") && (
          <section className="theme-panel rounded-[1.5rem] border p-5">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">
              database sync failed
            </p>
            <p className="theme-muted mt-2 font-semibold leading-7">
              Clerk auth is active, but Sama could not upsert the local user.
              Check DATABASE_URL and run Prisma setup before connecting real data.
            </p>
          </section>
        )}

        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-6">
            <section className="min-w-0">
              <div className="mb-4 flex min-w-0 flex-col items-start justify-between gap-2 sm:flex-row sm:items-end sm:gap-4">
                <h2 className="theme-heading min-w-0 text-4xl font-black lowercase">upcoming events</h2>
                <Link href="/dashboard/events/new" className="shrink-0 text-sm font-black text-lime-mute">create invite</Link>
              </div>

              {userResult.status === "ready" && realEvents.length === 0 ? (
                <div className="theme-panel rounded-[2rem] border p-6 sm:p-8">
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
                    no gatherings yet
                  </p>
                  <h3 className="theme-heading mt-3 text-4xl font-black lowercase">
                    create your first invite
                  </h3>
                  <p className="theme-muted mt-3 max-w-xl font-semibold leading-7">
                    Start with a poster, save the details, and Sama will give you
                    a public invite link to share.
                  </p>
                  <Link
                    href="/dashboard/events/new"
                    className="focus-ring theme-action mt-5 inline-flex rounded-full px-5 py-3 font-black"
                  >
                    Create your first invite
                  </Link>
                </div>
              ) : userResult.status === "ready" ? (
                <div className="grid min-w-0 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                  {realEvents.map((event) => {
                    const inviteUrl = `${origin}/invite/${event.slug}`;
                    const eventPendingApprovals = rsvpCountFor(
                      event.id,
                      (group) => group.approvalStatus === "PENDING",
                    );
                    const eventCheckedIn = rsvpCountFor(event.id, (group) => group.checkedIn);

                    return (
                      <article
                        key={event.id}
                        className="theme-panel tilt-card min-w-0 overflow-hidden rounded-[1.75rem] border"
                      >
                        <div className="film-grain relative min-h-44 bg-gradient-to-br from-fuchsia-950 via-rose-600 to-lime-mute p-5">
                          <span className="rounded-full bg-ivory px-3 py-1 text-xs font-black text-zinc-950">
                            {event.category || event.theme}
                          </span>
                          <h3 className="absolute bottom-5 left-5 right-5 text-3xl font-black lowercase leading-none text-white">
                            {event.title}
                          </h3>
                        </div>
                        <div className="space-y-4 p-5">
                          <p className="theme-heading text-sm font-black">
                            {formatDateTimeLabel(event.eventDate, event.eventTime)}
                          </p>
                          <p className="theme-muted text-sm font-semibold">
                            {event.city ? `${event.city} - ` : ""}
                            {event.location}
                          </p>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="rounded-full bg-black/35 px-3 py-1.5 text-xs font-black text-lime-mute">
                            {event._count.rsvps} RSVPs
                          </span>
                            {eventPendingApprovals > 0 && (
                              <span className="rounded-full bg-saffron-200 px-3 py-1.5 text-xs font-black text-zinc-950">
                                {eventPendingApprovals} pending
                              </span>
                            )}
                            <span className="rounded-full bg-black/35 px-3 py-1.5 text-xs font-black text-white">
                              {eventCheckedIn} checked in
                            </span>
                            <span className="rounded-full bg-black/35 px-3 py-1.5 text-xs font-black text-rose-neon">
                              {event.visibility}
                            </span>
                            {event.datePolls.length > 0 && (
                              <span className="rounded-full bg-black/35 px-3 py-1.5 text-xs font-black text-white">
                                poll active
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <CopyLinkButton value={inviteUrl} />
                            <Link
                              href={`/dashboard/events/${event.id}`}
                              className="focus-ring theme-action rounded-full px-4 py-2 text-sm font-black"
                            >
                              Manage
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="min-w-0 max-w-full overflow-hidden">
                  <div className="scroll-row flex max-w-full gap-4 overflow-x-auto px-1 pb-8 pt-3">
                    {hostEvents.map((event) => (
                      <EventCard key={event.title} event={event} size="dashboard" />
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="min-w-0">
              <div className="mb-4">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
                  today&apos;s pulse
                </p>
                <h2 className="theme-heading mt-2 text-4xl font-black lowercase">live room signals</h2>
              </div>
              <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
                <PulseCard label="new RSVPs today" value="18" accent="lime" />
                <PulseCard label="WhatsApp shares" value="7" accent="rose" />
                <PulseCard label="pending approvals" value={String(pendingApprovals)} accent="blue" />
                <PulseCard label="total RSVPs" value={String(totalRsvps)} accent="saffron" />
              </div>
            </section>

            <section className="grid min-w-0 gap-4 lg:grid-cols-2">
              <MomentumCard />
              <div className="grid min-w-0 gap-4">
                <HostChecklist />
                <RecentRsvps />
              </div>
            </section>

            <section className="min-w-0">
              <div className="mb-4">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">
                  featured invite preview
                </p>
                <h2 className="theme-heading mt-2 text-4xl font-black lowercase">
                  tonight&apos;s room card
                </h2>
              </div>
              <AnimatedInviteCard
                title={demoEvent.title}
                date={demoEvent.date}
                time={demoEvent.time}
                host={demoEvent.host}
                location={demoEvent.location}
                description="A compact preview of the invite your guests will open and share."
                guests={demoEvent.guests.slice(0, 4).map((guest) => guest.name.slice(0, 2).toUpperCase())}
                theme="afterdark"
                compact
              />
            </section>
          </div>

          <aside className="min-w-0 space-y-4 xl:sticky xl:top-6 xl:self-start">
            {profileIncomplete && <ProfileCompletionCard />}

            <section className="theme-panel min-w-0 rounded-[2rem] border p-5">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">quick actions</p>
              <div className="mt-4 grid gap-3">
                {["Copy invite link", "Send WhatsApp nudge", "Open guest list"].map((action) => (
                  <button key={action} type="button" className="focus-ring rounded-2xl bg-black/35 px-4 py-4 text-left font-black text-white hover:bg-white/10">
                    {action}
                  </button>
                ))}
              </div>
            </section>
            <section className="theme-panel min-w-0 rounded-[2rem] border p-5">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">activity feed</p>
              <div className="mt-4 space-y-3">
                {latestActivity.length
                  ? latestActivity.map((item) => (
                      <p key={item.id} className="rounded-2xl bg-black/35 px-4 py-3 text-sm font-bold text-zinc-300">
                        {item.message} <span className="text-zinc-500">- {item.eventTitle}</span>
                      </p>
                    ))
                  : recentActivity.map((item, index) => (
                      <p key={`${item}-${index}`} className="rounded-2xl bg-black/35 px-4 py-3 text-sm font-bold text-zinc-300">
                        {item}
                      </p>
                    ))}
              </div>
            </section>
            <section className="min-w-0 rounded-[2rem] border border-white/10 bg-lime-mute p-5 text-zinc-950">
              <p className="text-sm font-black uppercase tracking-[0.18em]">invite links</p>
              <h3 className="mt-3 text-2xl font-black lowercase">one link, whole room.</h3>
              <p className="mt-2 text-sm font-bold">Share on WhatsApp, stories, or the group chat.</p>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { CopyLinkButton } from "@/components/copy-link-button";
import { HostChecklist } from "@/components/dashboard/host-checklist";
import { MomentumCard } from "@/components/dashboard/momentum-card";
import { PulseCard } from "@/components/dashboard/pulse-card";
import { RecentRsvps } from "@/components/dashboard/recent-rsvps";
import { AnimatedInviteCard } from "@/components/invite/animated-invite-card";
import { ProfileCompletionCard } from "@/components/profile/profile-completion-card";
import { RealtimeRefresh } from "@/components/realtime/realtime-refresh";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { isClerkConfigured } from "@/lib/auth/config";
import { formatDateTimeLabel, formatEventDateShort } from "@/lib/date";
import { getEventTheme } from "@/lib/event-themes";
import { prisma } from "@/lib/prisma";
import { dashboardChannel } from "@/lib/realtime/events";

export const dynamic = "force-dynamic";

function warnQueryFailure(label: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`${label} failed: ${message}`);
}

async function safeQuery<T>(label: string, query: Promise<T>, fallback: T) {
  try {
    return await query;
  } catch (error) {
    warnQueryFailure(label, error);
    return fallback;
  }
}

function startOfLocalDay(date = new Date()) {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day;
}

function localDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function buildSevenDayMomentum(rsvps: { createdAt: Date }[]) {
  const today = startOfLocalDay();
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));

    return {
      key: localDateKey(date),
      day: new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(date),
      count: 0,
    };
  });

  const countByDay = new Map(days.map((day) => [day.key, day.count]));
  rsvps.forEach((rsvp) => {
    const key = localDateKey(startOfLocalDay(rsvp.createdAt));
    countByDay.set(key, (countByDay.get(key) ?? 0) + 1);
  });

  return days.map((day) => ({
    day: day.day,
    count: countByDay.get(day.key) ?? 0,
  }));
}

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
  const todayStart = startOfLocalDay();
  const sevenDaysStart = new Date(todayStart);
  sevenDaysStart.setDate(todayStart.getDate() - 6);
  const dashboardData =
    dbUser
      ? await (async () => {
          try {
            const events = await prisma.event.findMany({
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
                coverImage: true,
                visibility: true,
                capacity: true,
                requiresApproval: true,
                waitlistEnabled: true,
                datePolls: { select: { id: true }, take: 1 },
                _count: { select: { rsvps: true, memoryPhotos: true, infoBlocks: true, interests: true } },
              },
            });
            const eventIds = events.map((event) => event.id);

            if (eventIds.length === 0) {
              return {
                status: "ready" as const,
                partial: false,
                events,
                rsvpGroups: [],
                latestActivity: [],
                newRsvpsToday: 0,
                interestedGuests: 0,
                recentRsvps: [],
                sevenDayRsvps: [],
              };
            }

            const [
              rsvpGroups,
              latestActivity,
              newRsvpsToday,
              interestedGuests,
              recentRsvps,
              sevenDayRsvps,
            ] = await Promise.all([
              safeQuery(
                "Dashboard RSVP groups load",
                prisma.rSVP.groupBy({
                  by: ["eventId", "approvalStatus", "checkedIn"],
                  where: { eventId: { in: eventIds } },
                  _count: { _all: true },
                }),
                [],
              ),
              safeQuery(
                "Dashboard activity load",
                prisma.eventActivity.findMany({
                  where: { eventId: { in: eventIds } },
                  orderBy: { createdAt: "desc" },
                  take: 5,
                  select: {
                    id: true,
                    message: true,
                    createdAt: true,
                    event: { select: { title: true } },
                  },
                }),
                [],
              ),
              safeQuery(
                "Dashboard today RSVP count load",
                prisma.rSVP.count({
                  where: {
                    eventId: { in: eventIds },
                    createdAt: { gte: todayStart },
                  },
                }),
                0,
              ),
              safeQuery(
                "Dashboard interest count load",
                prisma.eventInterest.count({
                  where: { eventId: { in: eventIds } },
                }),
                0,
              ),
              safeQuery(
                "Dashboard recent RSVP load",
                prisma.rSVP.findMany({
                  where: { eventId: { in: eventIds } },
                  orderBy: { createdAt: "desc" },
                  take: 5,
                  select: {
                    id: true,
                    name: true,
                    status: true,
                    createdAt: true,
                    event: { select: { title: true } },
                  },
                }),
                [],
              ),
              safeQuery(
                "Dashboard momentum RSVP load",
                prisma.rSVP.findMany({
                  where: {
                    eventId: { in: eventIds },
                    createdAt: { gte: sevenDaysStart },
                  },
                  select: { createdAt: true },
                }),
                [],
              ),
            ]);

            return {
              status: "ready" as const,
              partial:
                rsvpGroups.length === 0 &&
                latestActivity.length === 0 &&
                newRsvpsToday === 0 &&
                interestedGuests === 0 &&
                recentRsvps.length === 0 &&
                sevenDayRsvps.length === 0 &&
                events.some((event) => event._count.rsvps > 0 || event._count.interests > 0),
              events,
              rsvpGroups,
              latestActivity,
              newRsvpsToday,
              interestedGuests,
              recentRsvps,
              sevenDayRsvps,
            };
          } catch (error) {
            warnQueryFailure("Dashboard event load", error);
            return {
              status: "database-error" as const,
              partial: false,
              events: [],
              rsvpGroups: [],
              latestActivity: [],
              newRsvpsToday: 0,
              interestedGuests: 0,
              recentRsvps: [],
              sevenDayRsvps: [],
            };
          }
        })()
      : {
          status: "idle" as const,
          partial: false,
          events: [],
          rsvpGroups: [],
          latestActivity: [],
          newRsvpsToday: 0,
          interestedGuests: 0,
          recentRsvps: [],
          sevenDayRsvps: [],
        };
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
  const recentRsvps = dashboardData.recentRsvps.map((rsvp) => ({
    id: rsvp.id,
    name: rsvp.name,
    status: rsvp.status,
    eventTitle: rsvp.event.title,
  }));
  const momentum = buildSevenDayMomentum(dashboardData.sevenDayRsvps);
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
      : [
          { label: "live events", value: "0", detail: "saved invites" },
          { label: "total RSVPs", value: "0", detail: "all guest replies" },
          { label: "approved", value: "0", detail: "cleared guests" },
          { label: "pending", value: "0", detail: "need host approval" },
          { label: "check-ins", value: "0", detail: "guests at the room" },
        ];
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
  const now = new Date();
  const nextEvent = realEvents.find((event) => event.eventDate >= startOfLocalDay(now)) ?? realEvents[0];
  const eventNeedingShare = realEvents.find((event) => event._count.rsvps === 0);
  const eventNeedingInfo = realEvents.find((event) => event._count.infoBlocks === 0);
  const eventWithin24Hours = realEvents.find((event) => {
    const eventDay = new Date(event.eventDate);
    const diff = eventDay.getTime() - now.getTime();

    return diff >= 0 && diff <= 24 * 60 * 60 * 1000;
  });
  const hostMoves = [
    ...(realEvents.length === 0
      ? [{ label: "Create your first invite", href: "/dashboard/events/new", active: true }]
      : []),
    ...(eventNeedingShare
      ? [{ label: `Share invite link for ${eventNeedingShare.title}`, href: `/invite/${eventNeedingShare.slug}`, active: true }]
      : []),
    ...(pendingApprovals > 0 && nextEvent
      ? [{ label: `Review ${pendingApprovals} pending approvals`, href: `/dashboard/events/${nextEvent.id}` }]
      : []),
    ...(eventWithin24Hours
      ? [{ label: `Prepare check-in for ${eventWithin24Hours.title}`, href: `/dashboard/events/${eventWithin24Hours.id}/check-in` }]
      : []),
    ...(profileIncomplete ? [{ label: "Complete organizer profile", href: "/dashboard/profile" }] : []),
    ...(eventNeedingInfo
      ? [{ label: `Add venue note for ${eventNeedingInfo.title}`, href: `/dashboard/events/${eventNeedingInfo.id}/info-blocks` }]
      : []),
  ].slice(0, 4);
  const featuredEvent = nextEvent;
  const featuredGuests =
    recentRsvps.length > 0
      ? recentRsvps.slice(0, 4).map((rsvp) => rsvp.name.slice(0, 2).toUpperCase())
      : ["GO", "RS", "VP"];
  const hostInitials = displayName.slice(0, 2).toUpperCase();
  const hostImageUrl = dbUser?.imageUrl ?? null;

  return (
    <main className="dark-stage min-h-screen text-foreground">
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
              The dashboard will load your real host signals once the database is connected.
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

        {dashboardData.status === "ready" && dashboardData.partial && (
          <section className="theme-panel rounded-[1.5rem] border p-5">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-saffron-200">
              live signals partially unavailable
            </p>
            <p className="theme-muted mt-2 font-semibold leading-7">
              Sama loaded your events, but Neon did not return every metric in time. Refresh in a moment for the latest pulse.
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
                          {event.coverImage && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={event.coverImage}
                              alt={`Cover image for ${event.title}`}
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/12 to-black/12" />
                          <span className="relative z-10 rounded-full bg-ivory px-3 py-1 text-xs font-black text-zinc-950">
                            {event.category || event.theme}
                          </span>
                          <span className="absolute right-5 top-5 z-10 grid size-9 place-items-center overflow-hidden rounded-full border border-white/20 bg-ivory text-xs font-black text-zinc-950">
                            {hostImageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={hostImageUrl}
                                alt={`${displayName} profile photo`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              hostInitials
                            )}
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
                <div className="theme-panel rounded-[2rem] border p-6 sm:p-8">
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">
                    dashboard unavailable
                  </p>
                  <h3 className="theme-heading mt-3 text-4xl font-black lowercase">
                    connect the database to load events
                  </h3>
                  <p className="theme-muted mt-3 max-w-xl font-semibold leading-7">
                    Once Neon is configured, your real hosted events will appear here.
                  </p>
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
                <PulseCard label="new RSVPs today" value={String(dashboardData.newRsvpsToday)} accent="lime" />
                <PulseCard label="interested guests" value={String(dashboardData.interestedGuests)} accent="rose" />
                <PulseCard label="pending approvals" value={String(pendingApprovals)} accent="blue" />
                <PulseCard label="total RSVPs" value={String(totalRsvps)} accent="saffron" />
              </div>
            </section>

            <section className="grid min-w-0 gap-4 lg:grid-cols-2">
              <MomentumCard momentum={momentum} />
              <div className="grid min-w-0 gap-4">
                <HostChecklist moves={hostMoves} />
                <RecentRsvps rsvps={recentRsvps} />
              </div>
            </section>

            {featuredEvent && (
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
                  title={featuredEvent.title}
                  date={formatEventDateShort(featuredEvent.eventDate)}
                  time={featuredEvent.eventTime}
                  host={displayName}
                  location={featuredEvent.location}
                  description="A compact preview of the invite your guests will open and share."
                  guests={featuredGuests}
                  theme={getEventTheme(featuredEvent.theme).inviteTheme}
                  coverImage={featuredEvent.coverImage}
                  compact
                />
              </section>
            )}
          </div>

          <aside className="scrollbar-none min-w-0 space-y-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto lg:pb-2">
            {profileIncomplete && <ProfileCompletionCard />}

            <section className="theme-panel min-w-0 rounded-[2rem] border p-5">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">quick actions</p>
              <div className="mt-4 grid gap-3">
                <Link href="/dashboard/events/new" className="focus-ring rounded-2xl bg-black/35 px-4 py-4 text-left font-black text-white hover:bg-white/10">
                  Create invite
                </Link>
                <Link href="/discover" className="focus-ring rounded-2xl bg-black/35 px-4 py-4 text-left font-black text-white hover:bg-white/10">
                  View public discover
                </Link>
                <Link href="/dashboard/profile" className="focus-ring rounded-2xl bg-black/35 px-4 py-4 text-left font-black text-white hover:bg-white/10">
                  Edit organizer profile
                </Link>
                <Link href="/dashboard/guests" className="focus-ring rounded-2xl bg-black/35 px-4 py-4 text-left font-black text-white hover:bg-white/10">
                  Open guest list
                </Link>
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
                  : (
                      <div className="rounded-2xl bg-black/35 px-4 py-5">
                        <h3 className="theme-heading text-xl font-black lowercase">no activity yet</h3>
                        <p className="theme-muted mt-2 text-sm font-semibold leading-6">
                          RSVP updates and host actions will appear here when they are recorded.
                        </p>
                      </div>
                    )}
              </div>
            </section>
          </aside>
        </div>

        <section className="min-w-0 rounded-[2rem] border border-white/10 bg-lime-mute p-6 text-zinc-950 shadow-[0_24px_80px_rgba(198,255,69,0.16)] sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em]">invite links</p>
              <h3 className="mt-3 text-4xl font-black lowercase leading-none sm:text-5xl">
                one link, whole room.
              </h3>
              <p className="mt-3 max-w-2xl text-sm font-bold sm:text-base">
                Share on WhatsApp, stories, or the group chat. Every guest opens the same live room.
              </p>
            </div>
            <Link
              href="/dashboard/invite-tools"
              className="focus-ring w-fit rounded-full bg-zinc-950 px-5 py-3 text-sm font-black text-lime-mute transition hover:-translate-y-0.5"
            >
              Open invite tools
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}

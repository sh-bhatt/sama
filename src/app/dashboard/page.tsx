import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { DashboardEventCardMenu } from "@/components/dashboard/dashboard-event-card-menu";
import { RealtimeRefresh } from "@/components/realtime/realtime-refresh";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { isClerkConfigured } from "@/lib/auth/config";
import { getCardDesignStyles } from "@/lib/card-design";
import { formatDateTimeLabel } from "@/lib/date";
import { getDerivedEventStatus } from "@/lib/event-lifecycle";
import { prisma } from "@/lib/prisma";
import { dashboardChannel } from "@/lib/realtime/events";

export const dynamic = "force-dynamic";

type DashboardFilter = "hosting" | "upcoming" | "live" | "past" | "archived";

type DashboardPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    status?: string | string[];
  }>;
};

function warnQueryFailure(label: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`${label} failed: ${message}`);
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toDashboardFilter(value: string | string[] | undefined): DashboardFilter {
  const status = firstParam(value);

  if (status === "upcoming" || status === "live" || status === "past" || status === "archived") {
    return status;
  }

  return "hosting";
}

function dashboardFilterHref(status: DashboardFilter, query: string) {
  const params = new URLSearchParams();

  if (status !== "hosting") {
    params.set("status", status);
  }

  if (query) {
    params.set("q", query);
  }

  const suffix = params.toString();

  return suffix ? `/dashboard?${suffix}` : "/dashboard";
}

async function safeQuery<T>(label: string, query: Promise<T>, fallback: T) {
  try {
    return await query;
  } catch (error) {
    warnQueryFailure(label, error);
    return fallback;
  }
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const resolvedSearchParams = await searchParams;
  const activeFilter = toDashboardFilter(resolvedSearchParams.status);
  const searchQuery = (firstParam(resolvedSearchParams.q) ?? "").trim();

  if (!isClerkConfigured()) {
    return (
      <main className="app-surface min-h-screen overflow-x-hidden px-4 py-6 text-foreground sm:px-6">
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
                cardDesign: true,
                visibility: true,
                status: true,
                startsAt: true,
                endsAt: true,
                endedAt: true,
                cancelledAt: true,
                archivedAt: true,
                capacity: true,
                requiresApproval: true,
                _count: { select: { rsvps: true } },
              },
            });
            const eventIds = events.map((event) => event.id);

            if (eventIds.length === 0) {
              return {
                status: "ready" as const,
                partial: false,
                events,
                rsvpGroups: [],
              };
            }

            const [rsvpGroups] = await Promise.all([
              safeQuery(
                "Dashboard RSVP groups load",
                prisma.rSVP.groupBy({
                  by: ["eventId", "approvalStatus", "checkedIn"],
                  where: { eventId: { in: eventIds } },
                  _count: { _all: true },
                }),
                [],
              ),
            ]);

            return {
              status: "ready" as const,
              partial:
                rsvpGroups.length === 0 &&
                events.some((event) => event._count.rsvps > 0),
              events,
              rsvpGroups,
            };
          } catch (error) {
            warnQueryFailure("Dashboard event load", error);
            return {
              status: "database-error" as const,
              partial: false,
              events: [],
              rsvpGroups: [],
            };
          }
        })()
      : {
          status: "idle" as const,
          partial: false,
          events: [],
          rsvpGroups: [],
        };
  const lifecycleRank = { live: 0, upcoming: 1, ended: 2, cancelled: 3, archived: 4 };
  const realEvents = [...dashboardData.events].sort((first, second) => {
    const firstStatus = getDerivedEventStatus(first);
    const secondStatus = getDerivedEventStatus(second);
    const statusDiff = lifecycleRank[firstStatus] - lifecycleRank[secondStatus];

    if (statusDiff !== 0) {
      return statusDiff;
    }

    return first.eventDate.getTime() - second.eventDate.getTime();
  });
  const matchesSearch = (event: (typeof realEvents)[number]) => {
    if (!searchQuery) {
      return true;
    }

    const haystack = [
      event.title,
      event.location,
      event.city,
      event.category,
      event.theme,
      event.visibility,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(searchQuery.toLowerCase());
  };
  const matchesFilter = (event: (typeof realEvents)[number]) => {
    const status = getDerivedEventStatus(event);

    if (activeFilter === "hosting") {
      return status !== "archived";
    }

    if (activeFilter === "past") {
      return status === "ended" || status === "cancelled";
    }

    return status === activeFilter;
  };
  const filteredEvents = realEvents.filter((event) => matchesSearch(event) && matchesFilter(event));
  const lifecycleCounts = realEvents.reduce(
    (counts, event) => {
      const status = getDerivedEventStatus(event);

      counts.hosting += status === "archived" ? 0 : 1;
      counts.upcoming += status === "upcoming" ? 1 : 0;
      counts.live += status === "live" ? 1 : 0;
      counts.past += status === "ended" || status === "cancelled" ? 1 : 0;
      counts.archived += status === "archived" ? 1 : 0;

      return counts;
    },
    { hosting: 0, upcoming: 0, live: 0, past: 0, archived: 0 } satisfies Record<DashboardFilter, number>,
  );
  const totalRsvps = realEvents.reduce((total, event) => total + event._count.rsvps, 0);
  const pendingApprovals = dashboardData.rsvpGroups
    .filter((group) => group.approvalStatus === "PENDING")
    .reduce((total, group) => total + group._count._all, 0);
  const checkedInGuests = dashboardData.rsvpGroups
    .filter((group) => group.checkedIn)
    .reduce((total, group) => total + group._count._all, 0);
  const summaryItems = [
    `${realEvents.length} events`,
    `${totalRsvps} RSVPs`,
    `${lifecycleCounts.upcoming} upcoming`,
    `${pendingApprovals} pending`,
    `${checkedInGuests} check-ins`,
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
  const hostInitials = displayName.slice(0, 2).toUpperCase();
  const hostImageUrl = dbUser?.imageUrl ?? null;

  return (
    <main className="dashboard-surface min-h-screen text-foreground">
      <header className="bg-[#fff8ee]/64 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
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
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl space-y-3.5 px-4 py-5 sm:px-6 lg:px-8">
        {dashboardRealtimeChannel && (
          <RealtimeRefresh
            channels={[dashboardRealtimeChannel]}
            enabled={Boolean(process.env.ABLY_API_KEY)}
            showIndicator={false}
            clerkUserId={userResult.clerkUser?.id}
          />
        )}

        <div className="pb-1">
          <div>
            <h1 className="max-w-3xl text-[1.72rem] font-black lowercase leading-[1.05] text-zinc-950 sm:text-[2.35rem]">
              Welcome back, {displayName}.
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm font-semibold leading-6 text-zinc-600">
              Manage your rooms, guests, and invites.
            </p>
            <p className="mt-2.5 flex flex-wrap gap-x-2 gap-y-1 text-[0.72rem] font-black uppercase tracking-[0.11em] text-zinc-500">
              {summaryItems.map((item, index) => (
                <span key={item}>
                  {index > 0 && <span className="mr-2 text-zinc-300">/</span>}
                  {item}
                </span>
              ))}
            </p>
          </div>
        </div>

        <section className="space-y-2.5">
          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
            <form action="/dashboard" className="min-w-0 flex-1">
              <input type="hidden" name="status" value={activeFilter === "hosting" ? "" : activeFilter} />
              <label htmlFor="dashboard-search" className="sr-only">Search events</label>
              <input
                id="dashboard-search"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search events, city, venue"
                className="focus-ring w-full rounded-full border border-zinc-950/10 bg-[#fffdf8]/68 px-4 py-2.5 text-sm font-bold text-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] placeholder:text-zinc-400"
              />
            </form>
            <div className="scrollbar-none -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
              {(
                [
                  ["hosting", "Hosting"],
                  ["upcoming", "Upcoming"],
                  ["live", "Live"],
                  ["past", "Past"],
                  ["archived", "Archived"],
                ] as const
              ).map(([status, label]) => {
                const active = activeFilter === status;

                return (
                  <Link
                    key={status}
                    href={dashboardFilterHref(status, searchQuery)}
                    className={[
                      "focus-ring shrink-0 rounded-full px-3.5 py-1.5 text-[0.82rem] font-black transition",
                      active
                        ? "border border-lime-500/25 bg-lime-mute/80 text-zinc-950 shadow-[0_8px_24px_rgba(198,255,69,0.16)]"
                        : "border border-zinc-950/10 bg-[#fffdf8]/58 text-zinc-700 hover:bg-[#fffdf8]/86",
                    ].join(" ")}
                  >
                    {label} {lifecycleCounts[status]}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

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

        <div className="min-w-0 space-y-6">
            <section className="min-w-0">
              <div className="mb-4">
                <div>
                  <h2 className="theme-heading min-w-0 text-3xl font-black lowercase sm:text-4xl">events</h2>
                  <p className="theme-muted mt-1 text-sm font-semibold">
                    {filteredEvents.length} shown from {realEvents.length} hosted rooms
                  </p>
                </div>
              </div>

              {userResult.status === "ready" && realEvents.length === 0 ? (
                <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                  <Link
                    href="/dashboard/events/new"
                    className="focus-ring group flex min-w-0 flex-col overflow-hidden rounded-[1.25rem] border border-dashed border-zinc-950/14 bg-[#fff6ec]/20 p-1.5 text-center shadow-[0_10px_28px_rgba(77,23,52,0.05)] transition hover:-translate-y-0.5 hover:border-plum/28 hover:bg-[#fff6ec]/36 hover:shadow-[0_18px_46px_rgba(77,23,52,0.09)]"
                  >
                    <span className="grid aspect-square place-items-center rounded-[1rem] bg-[radial-gradient(circle_at_22%_20%,rgba(255,46,139,0.18),transparent_32%),radial-gradient(circle_at_82%_12%,rgba(198,255,69,0.22),transparent_26%),linear-gradient(135deg,#fff0dc,#f4c8dc_48%,#dfd2ff)] transition group-hover:saturate-[1.06]">
                      <span className="grid size-10 place-items-center rounded-full bg-plum text-xl font-black text-ivory shadow-[0_12px_28px_rgba(77,23,52,0.22)] transition group-hover:scale-105">
                        +
                      </span>
                    </span>
                    <span className="px-1.5 pb-1 pt-2.5">
                      <span className="mt-3 block text-lg font-black lowercase text-zinc-950">New event</span>
                      <span className="mt-1 block text-xs font-semibold text-zinc-600">Start your first room.</span>
                    </span>
                  </Link>
                </div>
              ) : userResult.status === "ready" ? (
                <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                  <Link
                    href="/dashboard/events/new"
                    className="focus-ring group flex min-w-0 flex-col overflow-hidden rounded-[1.25rem] border border-dashed border-zinc-950/14 bg-[#fff6ec]/20 p-1.5 text-center shadow-[0_10px_28px_rgba(77,23,52,0.05)] transition hover:-translate-y-0.5 hover:border-plum/28 hover:bg-[#fff6ec]/36 hover:shadow-[0_18px_46px_rgba(77,23,52,0.09)]"
                  >
                    <span className="grid aspect-square place-items-center rounded-[1rem] bg-[radial-gradient(circle_at_22%_20%,rgba(255,46,139,0.18),transparent_32%),radial-gradient(circle_at_82%_12%,rgba(198,255,69,0.22),transparent_26%),linear-gradient(135deg,#fff0dc,#f4c8dc_48%,#dfd2ff)] transition group-hover:saturate-[1.06]">
                      <span className="grid size-10 place-items-center rounded-full bg-plum text-xl font-black text-ivory shadow-[0_12px_28px_rgba(77,23,52,0.22)] transition group-hover:scale-105">
                        +
                      </span>
                    </span>
                    <span className="px-1.5 pb-1 pt-2.5">
                      <span className="mt-3 block text-lg font-black lowercase text-zinc-950">New event</span>
                      <span className="mt-1 block text-xs font-semibold text-zinc-600">Design another invite.</span>
                    </span>
                  </Link>
                  {filteredEvents.length === 0 && (
                    <div className="rounded-[1.5rem] border border-zinc-950/10 bg-white/62 p-5">
                      <h3 className="text-2xl font-black lowercase text-zinc-950">No matching events</h3>
                      <p className="mt-2 text-sm font-semibold leading-6 text-zinc-600">
                        Adjust search or switch filters to see more rooms.
                      </p>
                    </div>
                  )}
                  {filteredEvents.map((event) => {
                    const inviteUrl = `${origin}/invite/${event.slug}`;
                    const manageHref = `/dashboard/events/${event.id}`;
                    const designStyles = getCardDesignStyles(event.cardDesign);
                    const lifecycleStatus = getDerivedEventStatus(event);
                    const cardStateClass =
                      lifecycleStatus === "archived" || lifecycleStatus === "cancelled"
                        ? "opacity-90"
                        : "";

                    return (
                      <article
                        key={event.id}
                        className={`tilt-card group relative flex min-w-0 cursor-pointer flex-col overflow-hidden border border-zinc-950/5 bg-[#fff6ec]/28 p-1.5 shadow-[0_10px_28px_rgba(77,23,52,0.06)] transition hover:border-plum/18 hover:bg-[#fff6ec]/44 hover:shadow-[0_18px_46px_rgba(77,23,52,0.10)] ${designStyles.cornerClass} ${cardStateClass}`}
                        style={designStyles.style}
                      >
                        <Link
                          href={manageHref}
                          aria-label={`Open ${event.title} management`}
                          className="focus-ring absolute inset-0 z-10 rounded-[inherit]"
                        />
                        <div className="film-grain relative aspect-square overflow-hidden rounded-[1rem] bg-[radial-gradient(circle_at_20%_14%,rgba(255,46,139,0.26),transparent_28%),radial-gradient(circle_at_82%_16%,rgba(198,255,69,0.18),transparent_24%),radial-gradient(circle_at_72%_86%,rgba(204,184,255,0.34),transparent_30%),linear-gradient(135deg,#ffd8c2_0%,#f4c8dc_46%,#d9d1ff_100%)] p-3 transition group-hover:saturate-[1.06]">
                          {event.coverImage && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={event.coverImage}
                              alt={`Cover image for ${event.title}`}
                              className={`absolute inset-0 h-full w-full ${designStyles.imageClass}`}
                            />
                          )}
                          <div className={`absolute inset-0 ${designStyles.overlayClass}`} />
                          {designStyles.textureClass && <div className={`absolute inset-0 ${designStyles.textureClass}`} />}
                          {!event.coverImage && (
                            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.32)_1px,transparent_1px)] bg-[length:17px_17px] opacity-25" />
                          )}
                          <span className="absolute left-3 top-3 z-10 max-w-[72%] truncate rounded-full bg-white/86 px-2.5 py-1 text-[0.68rem] font-black text-zinc-950 shadow-[0_8px_20px_rgba(0,0,0,0.10)] backdrop-blur">
                            {formatDateTimeLabel(event.eventDate, event.eventTime)}
                          </span>
                          <div className="absolute right-3 top-3 z-20">
                            <DashboardEventCardMenu inviteUrl={inviteUrl} manageHref={manageHref} />
                          </div>
                        </div>
                        <div className="relative z-0 flex flex-1 flex-col px-1.5 pb-1 pt-2.5">
                          <h3 className="line-clamp-1 text-lg font-black lowercase leading-[1.02] text-zinc-950">
                            {event.title}
                          </h3>
                          <div className="mt-2 flex min-w-0 items-center gap-2">
                            <span className="grid size-6 shrink-0 place-items-center overflow-hidden rounded-full border border-zinc-950/10 bg-ivory text-[0.6rem] font-black text-zinc-950">
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
                            <p className="min-w-0 truncate text-xs font-semibold text-zinc-500">
                              Hosted by{" "}
                              <span className="font-black text-zinc-800">{displayName}</span>
                            </p>
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
        </div>
      </section>
    </main>
  );
}

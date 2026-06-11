import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { DiscoverFilters } from "@/components/discovery/discover-filters";
import { DiscoverEventCard } from "@/components/discovery/discover-event-card";
import { DiscoverSection } from "@/components/discovery/discover-section";
import { EmptyDiscoverState } from "@/components/discovery/empty-discover-state";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { isClerkConfigured, isDatabaseConfigured } from "@/lib/auth/config";
import { getApprovedGoingCount, type PublicDiscoveryEvent } from "@/lib/discover";
import { prisma } from "@/lib/prisma";
import { parseDiscoverFilters } from "@/lib/validations/discover";

type DiscoverPageProps = {
  searchParams: Promise<{
    city?: string | string[];
    category?: string | string[];
    q?: string | string[];
  }>;
};

export const dynamic = "force-dynamic";

function getBufferedToday() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
}

function getNextWeek() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 7));
}

function getTrendingScore(event: PublicDiscoveryEvent) {
  const going = getApprovedGoingCount(event);
  const soonBoost = event.eventDate <= getNextWeek() ? 8 : 0;
  return event._count.interests + going + soonBoost;
}

function SetupMessage() {
  return (
    <main className="dark-stage min-h-screen overflow-x-hidden px-4 py-6 text-foreground sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="theme-panel rounded-[2rem] border p-6 sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">
            database setup needed
          </p>
          <h1 className="theme-heading mt-3 text-4xl font-black lowercase">
            connect Neon to discover live events
          </h1>
          <p className="theme-muted mt-4 font-semibold leading-7">
            Add DATABASE_URL, then run Prisma generate and db push. Demo discovery stays on the homepage until then.
          </p>
          <Link href="/" className="focus-ring theme-action mt-6 inline-flex rounded-full px-5 py-3 font-black">
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}

function DatabaseError() {
  return (
    <main className="dark-stage min-h-screen overflow-x-hidden px-4 py-6 text-foreground sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="theme-panel rounded-[2rem] border p-6 sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">
            discover paused
          </p>
          <h1 className="theme-heading mt-3 text-4xl font-black lowercase">
            public rooms need a refresh
          </h1>
          <p className="theme-muted mt-4 font-semibold leading-7">
            Sama could not reach Neon just now. Try again in a moment.
          </p>
          <Link href="/" className="focus-ring theme-action mt-6 inline-flex rounded-full px-5 py-3 font-black">
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const filters = parseDiscoverFilters(await searchParams);
  const userIdPromise = isClerkConfigured() ? auth().then((session) => session.userId) : Promise.resolve(null);

  if (!isDatabaseConfigured()) {
    return <SetupMessage />;
  }

  const where: Prisma.EventWhereInput = {
    visibility: "public",
    eventDate: { gte: getBufferedToday() },
  };

  if (filters.city) {
    where.city = { equals: filters.city, mode: "insensitive" };
  }

  if (filters.category) {
    where.category = { equals: filters.category, mode: "insensitive" };
  }

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
      { location: { contains: filters.q, mode: "insensitive" } },
      { city: { contains: filters.q, mode: "insensitive" } },
      { category: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  const eventResult = await prisma.event
    .findMany({
      where,
      orderBy: { eventDate: "asc" },
      take: 24,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        eventDate: true,
        eventTime: true,
        location: true,
        city: true,
        category: true,
        theme: true,
        coverImage: true,
        capacity: true,
        requiresApproval: true,
        waitlistEnabled: true,
        host: { select: { name: true, imageUrl: true, username: true, publicProfile: true } },
        _count: {
          select: {
            interests: true,
            rsvps: {
              where: {
                status: "GOING",
                approvalStatus: "APPROVED",
              },
            },
          },
        },
      },
    })
    .then((events) => ({ status: "ready" as const, events }))
    .catch((error) => {
      console.warn("Discover data load failed:", error);
      return { status: "database-error" as const, events: [] };
    });

  if (eventResult.status === "database-error") {
    return <DatabaseError />;
  }

  const userId = await userIdPromise;
  const events = eventResult.events;
  const trending = [...events].sort((a, b) => getTrendingScore(b) - getTrendingScore(a)).slice(0, 6);
  const thisWeek = events.filter((event) => event.eventDate <= getNextWeek()).slice(0, 8);
  const upcoming = events.slice(0, 12);

  return (
    <main className="dark-stage min-h-screen overflow-x-hidden text-foreground">
      <header className="border-b border-[color:var(--border)] bg-[color:var(--background)]/72 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-2xl font-black lowercase text-[color:var(--foreground)]">
            Sama
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-bold text-[color:var(--muted)] md:flex">
            <Link href="/discover" className="text-[color:var(--foreground)]">Discover</Link>
            <Link href="/dashboard" className="hover:text-[color:var(--foreground)]">Dashboard</Link>
            <Link href="/dashboard/events/new" className="hover:text-[color:var(--foreground)]">Create</Link>
          </nav>
          <div className="flex items-center gap-2">
            {userId ? (
              <div className="hidden sm:block">
                <UserButton />
              </div>
            ) : (
              <>
                <Link
                  href="/dashboard/events/new"
                  className="focus-ring rounded-full bg-lime-mute px-3 py-2 text-sm font-black text-zinc-950 sm:px-4"
                >
                  Host
                </Link>
                <Link
                  href="/sign-in"
                  className="focus-ring hidden rounded-full bg-[color:var(--card)] px-4 py-2 text-sm font-black text-[color:var(--foreground)] sm:inline-flex"
                >
                  Sign in
                </Link>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <section className="film-grain relative overflow-hidden border-b border-[color:var(--border)] bg-[radial-gradient(circle_at_18%_20%,rgba(255,46,139,0.34),transparent_26%),radial-gradient(circle_at_82%_20%,rgba(198,255,69,0.18),transparent_22%),linear-gradient(135deg,rgba(0,0,0,0.92),rgba(22,22,22,0.9))] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
            public rooms across india
          </p>
          <h1 className="mt-4 max-w-4xl text-6xl font-black lowercase leading-none text-white sm:text-8xl">
            find your next gathering
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-zinc-300">
            College nights, cafe gigs, creator meetups, art walks, food trails, and open rooms worth leaving home for.
          </p>
        </div>
      </section>

      <DiscoverFilters filters={filters} />

      {events.length ? (
        <>
          <DiscoverSection title="trending this week" eyebrow="guest energy" events={trending} />
          <div className="theme-editorial-band py-4">
            <DiscoverSection title="upcoming near you" eyebrow={filters.city || "india"} events={thisWeek.length ? thisWeek : upcoming} tone="light" />
          </div>
          <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">
                  browse all public events
                </p>
                <h2 className="theme-heading mt-2 text-5xl font-black lowercase">
                  rooms with an open door
                </h2>
              </div>
              <Link
                href="/dashboard/events/new"
                className="focus-ring theme-action inline-flex rounded-full px-5 py-3 text-sm font-black"
              >
                Host one
              </Link>
            </div>
            <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {upcoming.map((event) => (
                <DiscoverEventCard key={event.id} event={event} wide />
              ))}
            </div>
          </section>
        </>
      ) : (
        <EmptyDiscoverState />
      )}
    </main>
  );
}

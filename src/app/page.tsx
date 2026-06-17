import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ClientUserButton } from "@/components/auth/client-user-button";
import { CategoryPills } from "@/components/discovery/category-pills";
import { CityCard } from "@/components/discovery/city-card";
import { DiscoverSection } from "@/components/discovery/discover-section";
import { EventRow } from "@/components/discovery/event-row";
import { HeroDiscover } from "@/components/discovery/hero-discover";
import { isClerkConfigured, isDatabaseConfigured } from "@/lib/auth/config";
import { getApprovedGoingCount } from "@/lib/discover";
import { categories, cities, eventRows, moreCities } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const userIdPromise = isClerkConfigured() ? auth().then((session) => session.userId) : Promise.resolve(null);
  const realEventsPromise = isDatabaseConfigured()
    ? prisma.event
        .findMany({
          where: {
            visibility: "public",
            status: { in: ["PUBLISHED", "LIVE"] },
            eventDate: {
              gte: new Date(
                Date.UTC(
                  new Date().getUTCFullYear(),
                  new Date().getUTCMonth(),
                  new Date().getUTCDate() - 1,
                ),
              ),
            },
          },
          orderBy: { eventDate: "asc" },
          take: 8,
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
            cardDesign: true,
            status: true,
            startsAt: true,
            endsAt: true,
            endedAt: true,
            cancelledAt: true,
            archivedAt: true,
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
        .catch((error) => {
          console.warn("Homepage public event load failed:", error);
          return [];
        })
    : Promise.resolve([]);
  const [userId, realEvents] = await Promise.all([userIdPromise, realEventsPromise]);
  const trendingEvents = [...realEvents]
    .sort((a, b) => b._count.interests + getApprovedGoingCount(b) - (a._count.interests + getApprovedGoingCount(a)))
    .slice(0, 5);

  return (
    <main className="min-h-screen overflow-x-hidden app-surface text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[color:var(--border)] app-surface/72 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="text-2xl font-black lowercase tracking-tight text-[color:var(--foreground)]">
            Sama
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-bold text-[color:var(--muted)] md:flex">
            <Link href="/discover" className="hover:text-[color:var(--foreground)]">Discover</Link>
            <a href="#host" className="hover:text-[color:var(--foreground)]">Host</a>
            <a href="#cities" className="hover:text-[color:var(--foreground)]">Cities</a>
          </nav>
          <div className="flex min-w-0 items-center gap-2">
            {userId ? (
              <>
                <Link
                  href="/dashboard"
                  className="focus-ring rounded-full bg-[color:var(--accent)] px-3 py-2 text-sm font-black text-[color:var(--accent-contrast)] transition hover:-translate-y-0.5 sm:px-4"
                >
                  Dashboard
                </Link>
                <div className="hidden sm:block">
                  <ClientUserButton />
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="focus-ring hidden rounded-full bg-[color:var(--card)] px-4 py-2 text-sm font-black text-[color:var(--foreground)] transition hover:-translate-y-0.5 sm:inline-flex"
                >
                  Sign in
                </Link>
                <Link
                  href="/dashboard/events/new"
                  className="focus-ring rounded-full bg-[color:var(--accent)] px-3 py-2 text-sm font-black text-[color:var(--accent-contrast)] transition hover:-translate-y-0.5 sm:px-4"
                >
                  Create
                </Link>
              </>
            )}
            <button type="button" aria-label="Help" className="focus-ring hidden size-10 place-items-center rounded-full bg-[color:var(--card)] text-sm font-black text-[color:var(--foreground)] sm:grid">
              ?
            </button>
            {!userId && (
              <Link href="/dashboard" aria-label="Profile" className="focus-ring grid size-10 place-items-center rounded-full bg-gradient-to-br from-rose-neon to-lime-mute text-xs font-black text-zinc-950">
                AB
              </Link>
            )}
          </div>
        </div>
      </header>

      <HeroDiscover />

      <div id="discover" className="py-8">
        {realEvents.length ? (
          <DiscoverSection title="trending tonight" events={trendingEvents} />
        ) : (
          <EventRow title={eventRows[0].title} events={eventRows[0].events} wide />
        )}
        <CategoryPills categories={categories} />
        <div className="theme-editorial-band py-4">
          {realEvents.length ? (
            <DiscoverSection title="modern mehfil" events={realEvents.slice(0, 5)} tone="light" />
          ) : (
            <EventRow title={eventRows[1].title} events={eventRows[1].events} tone="light" />
          )}
        </div>
        {realEvents.length ? (
          <>
            <DiscoverSection title="evenings & weekends" events={realEvents.slice(3, 9).length ? realEvents.slice(3, 9) : realEvents} />
            <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
              <Link
                href="/discover"
                className="focus-ring theme-action inline-flex rounded-full px-5 py-3 font-black"
              >
                Open full Discover
              </Link>
            </section>
          </>
        ) : (
          eventRows.slice(2).map((row) => (
            <EventRow key={row.title} title={row.title} events={row.events} />
          ))
        )}
      </div>

      <section id="cities" className="mx-auto grid max-w-7xl gap-5 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_20rem] lg:px-8">
        <div>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
                cities alive
              </p>
              <h2 className="mt-2 text-5xl font-black lowercase tracking-tight text-[color:var(--foreground)]">
                pick your scene
              </h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {cities.map((city) => (
              <CityCard key={city.name} {...city} />
            ))}
          </div>
        </div>
        <aside className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--card)]/70 p-5">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[color:var(--muted)]">
            browse more
          </p>
          <div className="mt-4 space-y-3">
            {moreCities.map((city) => (
              <Link
                key={city}
                href={`/discover?city=${encodeURIComponent(city)}`}
                className="focus-ring flex w-full items-center justify-between rounded-2xl bg-[color:var(--card)] px-4 py-4 text-left font-black text-[color:var(--foreground)] transition hover:brightness-105"
              >
                {city}
                <span className="text-lime-mute">go</span>
              </Link>
            ))}
          </div>
        </aside>
      </section>

      <section id="host" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="film-grain relative overflow-hidden rounded-[2.25rem] border border-zinc-950/10 bg-[radial-gradient(circle_at_18%_16%,rgba(255,46,139,0.18),transparent_26%),radial-gradient(circle_at_82%_18%,rgba(198,255,69,0.2),transparent_22%),linear-gradient(135deg,#fff4df,#f8d7e5_52%,#eee0ff)] p-7 shadow-[0_24px_90px_rgba(77,23,52,0.14)] sm:p-10">
          <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
                not another registration form
              </p>
              <h2 className="mt-3 max-w-3xl text-5xl font-black lowercase leading-none text-zinc-950">
                host the room. send the link.
              </h2>
              <p className="mt-4 max-w-xl text-lg font-semibold leading-8 text-zinc-700">
                Discover gatherings, host beautiful events, collect RSVPs, and bring your people together.
              </p>
            </div>
            <Link
              href="/dashboard/events/new"
              className="focus-ring rounded-full bg-lime-mute px-6 py-4 text-center font-black text-zinc-950 transition hover:-translate-y-0.5"
            >
              Create an event for free
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[color:var(--border)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm font-bold text-[color:var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[color:var(--foreground)]">Sama</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/dashboard/events/new" className="hover:text-[color:var(--foreground)]">Create an event for free</Link>
            <a href="#host" className="hover:text-[color:var(--foreground)]">Help Center</a>
            <a href="#discover" className="hover:text-[color:var(--foreground)]">Blog</a>
            <Link href="/discover" className="hover:text-[color:var(--foreground)]">Discover</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

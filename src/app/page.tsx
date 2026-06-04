import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { CategoryPills } from "@/components/discovery/category-pills";
import { CityCard } from "@/components/discovery/city-card";
import { EventRow } from "@/components/discovery/event-row";
import { HeroDiscover } from "@/components/discovery/hero-discover";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { isClerkConfigured } from "@/lib/auth/config";
import { categories, cities, eventRows, moreCities } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const userId = isClerkConfigured() ? (await auth()).userId : null;

  return (
    <main className="dark-stage min-h-screen overflow-x-hidden text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[color:var(--border)] bg-[color:var(--background)]/72 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="text-2xl font-black lowercase tracking-tight text-[color:var(--foreground)]">
            Sama
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-bold text-[color:var(--muted)] md:flex">
            <a href="#discover" className="hover:text-[color:var(--foreground)]">Discover</a>
            <a href="#host" className="hover:text-[color:var(--foreground)]">Host</a>
            <a href="#cities" className="hover:text-[color:var(--foreground)]">Cities</a>
          </nav>
          <div className="flex items-center gap-2">
            {userId ? (
              <>
                <Link
                  href="/dashboard"
                  className="focus-ring rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-black text-[color:var(--accent-contrast)] transition hover:-translate-y-0.5"
                >
                  Dashboard
                </Link>
                <div className="hidden sm:block">
                  <UserButton />
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="focus-ring rounded-full bg-[color:var(--card)] px-4 py-2 text-sm font-black text-[color:var(--foreground)] transition hover:-translate-y-0.5"
                >
                  Sign in
                </Link>
                <Link
                  href="/dashboard/events/new"
                  className="focus-ring rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-black text-[color:var(--accent-contrast)] transition hover:-translate-y-0.5"
                >
                  Create
                </Link>
              </>
            )}
            <ThemeToggle />
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
        <EventRow title={eventRows[0].title} events={eventRows[0].events} wide />
        <CategoryPills categories={categories} />
        <div className="bg-ivory py-4 dark:bg-ivory">
          <EventRow title={eventRows[1].title} events={eventRows[1].events} tone="light" />
        </div>
        {eventRows.slice(2).map((row) => (
          <EventRow key={row.title} title={row.title} events={row.events} />
        ))}
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
              <button
                key={city}
                type="button"
                className="focus-ring flex w-full items-center justify-between rounded-2xl bg-[color:var(--card)] px-4 py-4 text-left font-black text-[color:var(--foreground)] transition hover:brightness-105"
              >
                {city}
                <span className="text-lime-mute">go</span>
              </button>
            ))}
          </div>
        </aside>
      </section>

      <section id="host" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="film-grain relative overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-zinc-900 via-fuchsia-950 to-black p-7 shadow-[0_24px_90px_rgba(0,0,0,0.48)] sm:p-10">
          <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
                not another registration form
              </p>
              <h2 className="mt-3 max-w-3xl text-5xl font-black lowercase leading-none text-white">
                host the room. send the link.
              </h2>
              <p className="mt-4 max-w-xl text-lg font-semibold leading-8 text-zinc-300">
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
            {["Create an event for free", "Help Center", "Blog", "Discover"].map((item) => (
              <a key={item} href="#discover" className="hover:text-white">
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}

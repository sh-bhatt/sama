import Link from "next/link";
import { discoverCategories, discoverCities } from "@/lib/discover";
import { cn } from "@/lib/utils";
import type { DiscoverFilters } from "@/lib/validations/discover";

function filterHref(next: Partial<DiscoverFilters>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(next)) {
    if (value) {
      params.set(key, value);
    }
  }

  const query = params.toString();
  return query ? `/discover?${query}` : "/discover";
}

export function DiscoverFilters({ filters }: { filters: DiscoverFilters }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
      <div className="theme-panel rounded-[2rem] border p-4 sm:p-5">
        <form action="/discover" className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
          <input
            name="q"
            defaultValue={filters.q || ""}
            placeholder="Search open mics, cafe gigs, food trails..."
            className="focus-ring min-w-0 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3 font-bold text-[color:var(--foreground)] placeholder:text-[color:var(--muted)]"
          />
          <button
            type="submit"
            className="focus-ring rounded-2xl bg-lime-mute px-5 py-3 font-black text-zinc-950 transition hover:-translate-y-0.5"
          >
            Search
          </button>
        </form>
        <div className="mt-4 space-y-3">
          <div className="scroll-row flex gap-2 overflow-x-auto pb-1">
            <Link
              href={filterHref({ category: filters.category, q: filters.q })}
              className={cn(
                "focus-ring shrink-0 rounded-full px-4 py-2 text-sm font-black",
                !filters.city ? "bg-lime-mute text-zinc-950" : "bg-[color:var(--card)] text-[color:var(--foreground)]",
              )}
            >
              All cities
            </Link>
            {discoverCities.map((city) => (
              <Link
                key={city}
                href={filterHref({ city, category: filters.category, q: filters.q })}
                className={cn(
                  "focus-ring shrink-0 rounded-full px-4 py-2 text-sm font-black transition hover:brightness-110",
                  filters.city === city ? "bg-lime-mute text-zinc-950" : "bg-[color:var(--card)] text-[color:var(--foreground)]",
                )}
              >
                {city}
              </Link>
            ))}
          </div>
          <div className="scroll-row flex gap-2 overflow-x-auto pb-1">
            <Link
              href={filterHref({ city: filters.city, q: filters.q })}
              className={cn(
                "focus-ring shrink-0 rounded-full px-4 py-2 text-sm font-black",
                !filters.category ? "bg-rose-neon text-white" : "bg-[color:var(--card)] text-[color:var(--foreground)]",
              )}
            >
              All scenes
            </Link>
            {discoverCategories.map((category) => (
              <Link
                key={category}
                href={filterHref({ city: filters.city, category, q: filters.q })}
                className={cn(
                  "focus-ring shrink-0 rounded-full px-4 py-2 text-sm font-black transition hover:brightness-110",
                  filters.category === category ? "bg-rose-neon text-white" : "bg-[color:var(--card)] text-[color:var(--foreground)]",
                )}
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

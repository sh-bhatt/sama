import Link from "next/link";
import { DiscoverEventCard } from "@/components/discovery/discover-event-card";
import type { PublicDiscoveryEvent } from "@/lib/discover";

export function DiscoverSection({
  title,
  eyebrow,
  events,
  tone = "dark",
  href = "/discover",
}: {
  title: string;
  eyebrow?: string;
  events: PublicDiscoveryEvent[];
  tone?: "dark" | "light";
  href?: string;
}) {
  const isLight = tone === "light";

  if (!events.length) {
    return null;
  }

  return (
    <section className="animate-fade-up py-4 sm:py-5">
      <div className="mx-auto flex max-w-7xl items-end justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div>
          {eyebrow && (
            <p className={isLight ? "text-sm font-black uppercase tracking-[0.18em] text-zinc-700" : "text-sm font-black uppercase tracking-[0.18em] text-lime-mute"}>
              {eyebrow}
            </p>
          )}
          <h2 className={isLight ? "mt-2 text-4xl font-black lowercase tracking-tight text-zinc-950 sm:text-5xl" : "mt-2 text-4xl font-black lowercase tracking-tight text-[color:var(--foreground)] sm:text-5xl"}>
            {title}
          </h2>
        </div>
        <Link
          href={href}
          className={isLight ? "focus-ring rounded-full bg-zinc-950 px-4 py-2 text-sm font-black text-ivory transition hover:-translate-y-0.5 hover:bg-zinc-800" : "focus-ring rounded-full bg-[color:var(--card)] px-4 py-2 text-sm font-black text-[color:var(--foreground)] transition hover:-translate-y-0.5 hover:brightness-110"}
        >
          see all
        </Link>
      </div>
      <div className="scroll-row overflow-x-auto overflow-y-hidden px-4 pb-10 pt-6 sm:px-6 sm:pb-12 sm:pt-7 lg:px-8">
        <div className="mx-auto flex w-max max-w-7xl gap-4 lg:w-full lg:justify-center">
          {events.map((event) => (
            <DiscoverEventCard key={event.id} event={event} wide />
          ))}
        </div>
      </div>
    </section>
  );
}

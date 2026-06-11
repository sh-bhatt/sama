import type { DiscoveryEvent } from "@/lib/mock-data";
import { EventCard } from "./event-card";

type EventRowProps = {
  title: string;
  events: DiscoveryEvent[];
  wide?: boolean;
  tone?: "dark" | "light";
};

export function EventRow({ title, events, wide = false, tone = "dark" }: EventRowProps) {
  const isLight = tone === "light";

  return (
    <section className="animate-fade-up py-4 sm:py-5">
      <div className="mx-auto flex max-w-7xl items-end justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <h2
          className={[
            "text-4xl font-black lowercase tracking-tight sm:text-5xl",
            isLight ? "theme-editorial-heading" : "text-[color:var(--foreground)]",
          ].join(" ")}
        >
          {title}
        </h2>
        <button
          type="button"
          className={[
            "focus-ring rounded-full px-4 py-2 text-sm font-black transition hover:-translate-y-0.5",
            isLight
              ? "theme-editorial-action hover:brightness-110"
              : "bg-[color:var(--card)] text-[color:var(--foreground)] hover:brightness-110",
          ].join(" ")}
        >
          see all
        </button>
      </div>
      <div className="scroll-row overflow-x-auto overflow-y-hidden px-4 pb-10 pt-6 sm:px-6 sm:pb-12 sm:pt-7 lg:px-8">
        <div className="mx-auto flex w-max max-w-7xl gap-4 lg:w-full lg:justify-center">
          {events.map((event) => (
            <EventCard key={event.title} event={event} wide={wide} />
          ))}
        </div>
      </div>
    </section>
  );
}

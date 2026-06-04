import type { DiscoveryEvent } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const posterVariants: Record<DiscoveryEvent["variant"], string> = {
  rose: "from-fuchsia-600 via-rose-500 to-orange-300",
  lime: "from-lime-300 via-emerald-500 to-zinc-950",
  saffron: "from-amber-200 via-orange-500 to-red-700",
  blue: "from-sky-400 via-blue-700 to-fuchsia-700",
  plum: "from-zinc-950 via-fuchsia-900 to-rose-500",
  coral: "from-red-500 via-orange-400 to-yellow-200",
};

type EventCardProps = {
  event: DiscoveryEvent;
  wide?: boolean;
  size?: "default" | "dashboard";
};

export function EventCard({ event, wide = false, size = "default" }: EventCardProps) {
  return (
    <article
      className={cn(
        "tilt-card group relative shrink-0 overflow-hidden rounded-[1.6rem] border border-white/10 bg-zinc-900 shadow-[0_22px_70px_rgba(0,0,0,0.38)]",
        size === "dashboard"
          ? "w-[min(82vw,320px)] sm:w-80"
          : wide
            ? "w-[19rem] sm:w-[24rem]"
            : "w-[16.5rem]",
      )}
    >
      <div
        className={cn(
          "film-grain poster-mesh relative h-60 overflow-hidden bg-gradient-to-br",
          posterVariants[event.variant],
        )}
      >
        <div className="poster-orb absolute -left-10 top-6 size-36 rounded-full bg-white/28 blur-2xl" />
        <div className="poster-orb absolute bottom-8 right-0 size-32 rounded-full bg-lime-mute/30 blur-2xl [animation-delay:900ms]" />
        <div className="gradient-drift absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(255,255,255,0.32),transparent_18%),radial-gradient(circle_at_78%_24%,rgba(255,255,255,0.2),transparent_20%),linear-gradient(to_top,rgba(0,0,0,0.62),rgba(0,0,0,0.04)_58%)]" />
        <div className="poster-shine pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0" />
        <button
          type="button"
          aria-label={`Save ${event.title}`}
          className="focus-ring animate-soft-pulse absolute right-3 top-3 rounded-full bg-black/50 px-3 py-2 text-sm font-black text-white backdrop-blur"
        >
          save
        </button>
        <div className="absolute bottom-4 left-4 right-4">
          <span className="rounded-full bg-ivory px-3 py-1 text-xs font-black text-zinc-950">
            {event.category}
          </span>
          <h3 className="mt-3 text-2xl font-black leading-none text-white">{event.title}</h3>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <p className="text-sm font-bold text-zinc-200">{event.dateTime}</p>
        <p className="text-sm text-zinc-400">
          {event.city} · {event.location}
        </p>
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-white/8 px-3 py-1.5 text-xs font-black text-lime-200">
            {event.interested}
          </span>
          <span className="text-xs font-bold text-zinc-500">find the night</span>
        </div>
      </div>
    </article>
  );
}

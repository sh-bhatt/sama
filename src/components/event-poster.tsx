import { demoEvent } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type EventPosterProps = {
  compact?: boolean;
  className?: string;
};

export function EventPoster({ compact = false, className }: EventPosterProps) {
  return (
    <article
      className={cn(
        "noise-overlay animate-poster-in tilt-card relative overflow-hidden rounded-[2.75rem] bg-[radial-gradient(circle_at_18%_18%,#f8cbd4_0,#f8cbd4_15%,transparent_16%),radial-gradient(circle_at_82%_26%,#f3b45b_0,#f3b45b_13%,transparent_14%),linear-gradient(135deg,#2b0c1e,#6f2448_50%,#e96f62)] p-5 text-white shadow-card",
        compact ? "min-h-80" : "min-h-[560px]",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.24),transparent_36%,rgba(255,255,255,0.14))]" />
      <div className="relative flex flex-wrap gap-2">
        <span className="rounded-full bg-white/16 px-4 py-2 text-xs font-bold backdrop-blur-xl">
          {demoEvent.date}
        </span>
        <span className="rounded-full bg-white/16 px-4 py-2 text-xs font-bold backdrop-blur-xl">
          Delhi
        </span>
      </div>
      <div className="absolute right-6 top-24 rounded-full border border-white/20 bg-white/14 px-4 py-2 text-sm font-bold backdrop-blur-xl">
        live invite
      </div>
      <div className="absolute bottom-7 left-5 right-5">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/70">{demoEvent.host}</p>
        <h2 className={cn("mt-3 font-semibold leading-none", compact ? "text-5xl" : "text-7xl sm:text-8xl")}>
          {demoEvent.title}
        </h2>
        <p className="mt-5 max-w-xl text-base leading-7 text-white/78">{demoEvent.description}</p>
      </div>
    </article>
  );
}

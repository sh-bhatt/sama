import { cn } from "@/lib/utils";

type InviteTheme = "sunset" | "afterdark" | "mehfil" | "neon" | "campus";

type AnimatedInviteCardProps = {
  title: string;
  date: string;
  time: string;
  host: string;
  location: string;
  description: string;
  guests: string[];
  theme?: InviteTheme;
  compact?: boolean;
  className?: string;
};

const themeClasses: Record<InviteTheme, string> = {
  sunset: "from-orange-500 via-rose-neon to-amber-200",
  afterdark: "from-zinc-950 via-fuchsia-900 to-blue-500",
  mehfil: "from-fuchsia-950 via-rose-600 to-saffron-200",
  neon: "from-electric via-rose-neon to-lime-mute",
  campus: "from-lime-mute via-emerald-500 to-zinc-950",
};

export function AnimatedInviteCard({
  title,
  date,
  time,
  host,
  location,
  description,
  guests,
  theme = "mehfil",
  compact = false,
  className,
}: AnimatedInviteCardProps) {
  return (
    <article
      className={cn(
        "invite-glow group relative overflow-hidden rounded-[2.25rem] border border-white/12 bg-zinc-950 shadow-[0_28px_110px_rgba(0,0,0,0.55)]",
        compact ? "p-4 sm:p-5" : "p-4 sm:p-6 lg:p-7",
        className,
      )}
    >
      <div
        className={cn(
          "liquid-gradient absolute inset-0 bg-gradient-to-br opacity-95",
          themeClasses[theme],
        )}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_16%,rgba(255,255,255,0.28),transparent_24%),radial-gradient(circle_at_86%_72%,rgba(255,255,255,0.18),transparent_28%),linear-gradient(to_top,rgba(0,0,0,0.74),rgba(0,0,0,0.16))]" />
      <div className="film-grain absolute inset-0" />

      <div className={cn("relative z-10 grid gap-5", compact ? "" : "lg:grid-cols-[1fr_0.72fr]")}>
        <div className="flex min-w-0 flex-col justify-between gap-7">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-ivory px-3 py-1.5 text-xs font-black text-zinc-950">
                {date}
              </span>
              <span className="rounded-full bg-black/35 px-3 py-1.5 text-xs font-black text-white backdrop-blur">
                {time}
              </span>
            </div>
            <p className="mt-7 text-sm font-black uppercase tracking-[0.18em] text-white/70">
              hosted by {host}
            </p>
            <h2
              className={cn(
                "mt-3 font-black lowercase leading-none tracking-tight text-white",
                compact ? "text-4xl sm:text-5xl" : "text-6xl sm:text-7xl xl:text-8xl",
              )}
            >
              {title}
            </h2>
            <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-white/78">
              {description}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {["Going", "Maybe", "Can't go"].map((label, index) => (
                <button
                  key={label}
                  type="button"
                  className={cn(
                    "focus-ring rounded-full px-4 py-3 text-sm font-black shadow-[0_12px_40px_rgba(0,0,0,0.24)] transition hover:-translate-y-0.5 active:scale-[0.98]",
                    index === 0
                      ? "bg-ivory text-zinc-950"
                      : "border border-white/14 bg-white/12 text-white backdrop-blur hover:bg-white/18",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex -space-x-3">
                {guests.map((guest, index) => (
                  <span
                    key={`${guest}-${index}`}
                    className="animate-soft-float grid size-10 place-items-center rounded-full border-2 border-black/30 bg-ivory text-xs font-black text-zinc-950"
                    style={{ animationDelay: `${index * 140}ms` }}
                  >
                    {guest}
                  </span>
                ))}
              </div>
              <p className="max-w-[11rem] text-right text-xs font-black uppercase tracking-[0.14em] text-white/66">
                {location}
              </p>
            </div>
          </div>
        </div>

        <div className={cn("relative min-h-64 overflow-hidden rounded-[1.7rem] border border-white/14 bg-black/28", compact ? "hidden" : "")}>
          <div className="gradient-drift absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(255,255,255,0.36),transparent_18%),radial-gradient(circle_at_76%_34%,rgba(198,255,69,0.28),transparent_20%),linear-gradient(135deg,rgba(0,0,0,0.12),rgba(0,0,0,0.62))]" />
          <div className="absolute inset-x-5 top-5 flex justify-between">
            <span className="rounded-full bg-black/42 px-3 py-1 text-xs font-black text-white backdrop-blur">
              poster
            </span>
            <span className="rounded-full bg-ivory px-3 py-1 text-xs font-black text-zinc-950">
              live invite
            </span>
          </div>
          <div className="absolute bottom-5 left-5 right-5">
            <div className="h-24 rounded-[1.3rem] bg-white/14 backdrop-blur-sm" />
            <p className="mt-3 text-sm font-black text-white/78">
              soft lights, city noise, familiar faces
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

import Link from "next/link";

export default function MemoriesPage() {
  const tiles = [
    ["sm:col-span-2 sm:row-span-2 from-rose-neon to-orange-400", "first song"],
    ["from-lime-mute to-emerald-500", "courtyard lights"],
    ["from-electric to-fuchsia-500", "table stories"],
    ["from-amber-300 to-red-500", "one more photo"],
    ["from-zinc-800 to-rose-neon", "late chai"],
    ["sm:col-span-2 from-white to-zinc-500", "everyone stayed"],
    ["from-fuchsia-700 to-blue-500", "soft blur"],
    ["from-orange-300 to-lime-mute", "last chorus"],
  ];

  return (
    <main className="app-surface min-h-screen text-foreground">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <Link href="/invite/demo" className="focus-ring inline-flex rounded-full bg-[color:var(--card)] px-4 py-2 text-sm font-black text-[color:var(--foreground)]">
            Back to invite
          </Link>
        </div>

        <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">photo dump</p>
            <h1 className="theme-heading mt-3 max-w-4xl text-6xl font-black lowercase leading-none sm:text-8xl">
              memories from moonlit mehfil
            </h1>
            <p className="theme-muted mt-4 max-w-2xl text-lg font-semibold leading-8">
              Disposable camera energy for plans that deserve a little noise.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" className="focus-ring rounded-full bg-lime-mute px-5 py-3 font-black text-zinc-950">
              Add photos
            </button>
            <button type="button" className="focus-ring rounded-full border border-zinc-950/10 bg-white/58 px-5 py-3 font-black text-zinc-950">
              Share memories
            </button>
          </div>
        </div>

        <div className="relative mt-8 overflow-hidden rounded-[2rem] border border-zinc-950/10 bg-white/58 p-3">
          <div className="liquid-gradient absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,46,139,0.2),transparent_24%),radial-gradient(circle_at_78%_70%,rgba(249,217,130,0.18),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))]" />
          <div className="relative z-10 grid auto-rows-[11rem] grid-cols-2 gap-3 sm:grid-cols-4">
            {tiles.map(([gradient, caption], index) => (
              <div
                key={caption}
                className={`tilt-card film-grain relative overflow-hidden rounded-[1.6rem] bg-gradient-to-br ${gradient} shadow-[0_22px_70px_rgba(0,0,0,0.42)]`}
                aria-label={`Memory placeholder ${index + 1}`}
              >
                <span
                  className="animate-float absolute bottom-3 left-3 rounded-full bg-white/72 px-3 py-1.5 text-xs font-black text-zinc-950 backdrop-blur"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  {caption}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export function HeroDiscover() {
  return (
    <section className="film-grain relative min-h-[72vh] overflow-hidden rounded-b-[2.5rem] bg-[radial-gradient(circle_at_20%_15%,rgba(255,46,139,0.65),transparent_24%),radial-gradient(circle_at_78%_12%,rgba(198,255,69,0.42),transparent_18%),linear-gradient(135deg,#050505,#151515_42%,#5b123f)]">
      <div className="liquid-gradient absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,46,139,0.48),transparent_24%),radial-gradient(circle_at_78%_20%,rgba(198,255,69,0.28),transparent_20%),radial-gradient(circle_at_55%_76%,rgba(59,130,255,0.28),transparent_26%)]" />
      <div className="animate-shimmer absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.08),transparent_35%,rgba(255,196,61,0.18),transparent_68%)] bg-[length:180%_180%]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/24 to-black/35" />
      <div className="absolute left-6 top-28 h-28 w-1 rotate-12 rounded-full bg-rose-400/80 blur-sm" />
      <div className="animate-float absolute right-8 top-36 h-20 w-20 rounded-full bg-lime-300/30 blur-xl" />
      <div className="relative mx-auto flex min-h-[72vh] max-w-7xl flex-col items-center justify-center px-4 text-center">
        <p className="mb-5 rounded-full bg-black/42 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-lime-200 backdrop-blur">
          social events for modern india
        </p>
        <div className="-rotate-2 rounded-[1.2rem] bg-ivory px-6 py-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:px-10 sm:py-5">
          <h1 className="text-6xl font-black lowercase leading-none tracking-tight text-zinc-950 sm:text-8xl lg:text-9xl">
            discover india
          </h1>
        </div>
        <p className="mt-8 max-w-2xl text-lg font-semibold leading-8 text-zinc-200 sm:text-xl">
          Find the night. Host the room. Send the link. Watch the guest list wake up.
        </p>
      </div>
    </section>
  );
}

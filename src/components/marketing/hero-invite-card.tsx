export function HeroInviteCard() {
  const guests = ["AM", "RK", "IZ", "NP"];

  return (
    <div className="relative mx-auto w-full max-w-md">
      <article className="tilt-card animate-poster-in overflow-hidden rounded-[2.75rem] border border-white/80 bg-white shadow-card">
        <div className="noise-overlay relative min-h-80 bg-[radial-gradient(circle_at_24%_20%,#ffd7b7_0,#ffd7b7_17%,transparent_18%),radial-gradient(circle_at_72%_34%,#f4a9b8_0,#f4a9b8_16%,transparent_17%),linear-gradient(135deg,#551b3b,#8e3452_54%,#f3b45b)] p-6 text-white">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.28),transparent)] opacity-60" />
          <div className="relative flex items-center justify-between">
            <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-semibold backdrop-blur">
              Sat, 21 June
            </span>
            <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-semibold backdrop-blur">
              Delhi
            </span>
          </div>
          <div className="absolute right-6 top-20 rotate-6 rounded-2xl bg-white/18 px-4 py-3 text-sm font-black backdrop-blur">
            mehfil mode
          </div>
          <div className="relative mt-28">
            <p className="text-sm font-medium text-white/80">Aarav & Friends invite you to</p>
            <h2 className="mt-2 text-5xl font-semibold leading-none">Moonlit Mehfil</h2>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex flex-wrap gap-2">
            {["Going 86", "Maybe 14", "Cant make it 9"].map((pill) => (
              <span
                key={pill}
                className="rounded-full border border-plum-950/10 bg-ivory px-3 py-1.5 text-sm font-semibold text-charcoal"
              >
                {pill}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex -space-x-3">
              {guests.map((guest) => (
                <span
                  key={guest}
                  className="animate-float grid size-11 place-items-center rounded-full border-2 border-white bg-plum-100 text-sm font-bold text-plum-900"
                >
                  {guest}
                </span>
              ))}
            </div>
            <button className="rounded-full bg-plum-900 px-4 py-2 text-sm font-semibold text-white">
              RSVP now
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}

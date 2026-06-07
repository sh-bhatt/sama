import Link from "next/link";
import { AnimatedInviteCard } from "@/components/invite/animated-invite-card";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { demoEvent, recentActivity } from "@/lib/mock-data";

export default function DemoInvitePage() {
  return (
    <main className="dark-stage min-h-screen overflow-hidden pb-28 text-foreground lg:pb-0">
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[1fr_24rem] lg:px-8 lg:py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="focus-ring inline-flex rounded-full bg-[color:var(--card)] px-4 py-2 text-sm font-black text-[color:var(--foreground)]">
              Sama
            </Link>
            <ThemeToggle />
          </div>

          <AnimatedInviteCard
            title={demoEvent.title}
            date={demoEvent.date}
            time={demoEvent.time}
            host={demoEvent.host}
            location={demoEvent.location}
            description={demoEvent.description}
            guests={demoEvent.guests.map((guest) => guest.name.slice(0, 2).toUpperCase())}
            theme="mehfil"
          />

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["date", demoEvent.date],
              ["time", demoEvent.time],
              ["place", demoEvent.location],
            ].map(([label, value]) => (
              <article key={label} className="theme-panel rounded-[1.5rem] border p-5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-lime-mute">{label}</p>
                <h2 className="theme-heading mt-2 text-xl font-black">{value}</h2>
              </article>
            ))}
          </div>

          <section className="theme-panel rounded-[2rem] border p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">
                  guest list
                </p>
                <h2 className="theme-heading mt-2 text-4xl font-black lowercase">the room is waking up</h2>
              </div>
              <button type="button" className="focus-ring rounded-full bg-[#25D366] px-5 py-3 font-black text-zinc-950">
                WhatsApp share
              </button>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {demoEvent.guests.map((guest, index) => (
                <div
                  key={guest.name}
                  className="animate-float flex items-center gap-3 rounded-full bg-black/42 px-3 py-2"
                  style={{ animationDelay: `${index * 140}ms` }}
                >
                  <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-rose-neon to-lime-mute text-xs font-black text-zinc-950">
                    {guest.name.slice(0, 1)}
                  </span>
                  <span>
                    <span className="block text-sm font-black text-white">{guest.name}</span>
                    <span className="block text-xs text-zinc-400">{guest.status}</span>
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <article className="rounded-[2rem] border border-white/10 bg-lime-mute p-6 text-zinc-950">
              <p className="text-sm font-black uppercase tracking-[0.16em]">UPI contribution</p>
              <h2 className="mt-3 text-2xl font-black">{demoEvent.contribution}</h2>
            </article>
            <article className="theme-panel rounded-[2rem] border p-6">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-lime-mute">date poll</p>
              <div className="mt-4 space-y-4">
                {demoEvent.poll.map((option, index) => (
                  <div key={option.label}>
                    <div className="theme-heading flex justify-between text-sm font-black">
                      <span>{option.label}</span>
                      <span>{option.votes}</span>
                    </div>
                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="animate-fade-up h-3 rounded-full bg-gradient-to-r from-rose-neon to-lime-mute"
                        style={{ width: `${Math.min(option.votes * 2, 92)}%`, animationDelay: `${index * 120}ms` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-5 lg:self-start">
          <section className="rounded-[2rem] border border-white/10 bg-zinc-950 p-5 shadow-[0_22px_80px_rgba(0,0,0,0.5)]">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">rsvp</p>
            <h2 className="mt-2 text-3xl font-black lowercase text-white">are you in?</h2>
            <div className="mt-5 grid gap-2">
              {["Going", "Maybe", "Not going"].map((item, index) => (
                <button
                  key={`${item}-${index}`}
                  type="button"
                  className={[
                    "focus-ring rounded-2xl px-4 py-4 text-left font-black transition active:scale-[0.98]",
                    index === 0 ? "animate-soft-pulse bg-ivory text-zinc-950" : "bg-white/8 text-white hover:bg-white/12",
                  ].join(" ")}
                >
                  {item}
                </button>
              ))}
            </div>
          </section>

          <section className="theme-panel rounded-[2rem] border p-5">
            <p className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-rose-neon">activity</p>
            <div className="space-y-3">
              {recentActivity.slice(0, 3).map((item, index) => (
                <p key={`${item}-${index}`} className="rounded-2xl bg-black/35 px-4 py-3 text-sm font-bold text-zinc-300">
                  {item}
                </p>
              ))}
            </div>
          </section>

          <Link href="/invite/demo/memories" className="focus-ring theme-panel block rounded-[2rem] border p-5">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">memories teaser</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {["from-rose-neon to-orange-400", "from-lime-mute to-emerald-500", "from-electric to-fuchsia-500", "from-amber-300 to-red-500", "from-zinc-800 to-rose-neon", "from-white to-zinc-500"].map((tile) => (
                <span key={tile} className={`aspect-square rounded-xl bg-gradient-to-br ${tile}`} />
              ))}
            </div>
          </Link>
        </aside>
      </section>

      <div className="fixed inset-x-3 bottom-3 z-40 rounded-full border border-white/10 bg-zinc-950/92 p-2 shadow-[0_20px_70px_rgba(0,0,0,0.55)] backdrop-blur lg:hidden">
        <div className="grid grid-cols-3 gap-2">
          {["Going", "Maybe", "Share"].map((item, index) => (
            <button key={`${item}-${index}`} type="button" className={index === 0 ? "rounded-full bg-ivory px-3 py-3 text-sm font-black text-zinc-950" : "rounded-full bg-white/8 px-3 py-3 text-sm font-black text-white"}>
              {item}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { studioThemes } from "@/lib/mock-data";

const inputClass =
  "focus-ring mt-2 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3 font-bold text-[color:var(--foreground)] placeholder:text-[color:var(--muted)]";

export default function NewEventPage() {
  return (
    <main className="dark-stage min-h-screen text-foreground">
      <header className="border-b border-[color:var(--border)] bg-[color:var(--background)]/72 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-2xl font-black lowercase text-[color:var(--foreground)]">Sama</Link>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-sm font-black text-lime-mute">Dashboard</Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_25rem] lg:px-8">
        <div>
          <Link href="/dashboard" className="text-sm font-black text-lime-mute">Back to dashboard</Link>
          <h1 className="theme-heading mt-4 max-w-3xl text-6xl font-black lowercase leading-none">
            start with the vibe
          </h1>
          <p className="theme-muted mt-4 max-w-2xl text-lg font-semibold leading-8">
            Build a poster first. Add date, place, RSVP, and the small things that make people show up.
          </p>

          <form className="mt-8 space-y-5">
            <section className="theme-panel rounded-[2rem] border p-5 sm:p-7">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">event details</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="theme-muted text-sm font-black">Event title</span>
                  <input className={inputClass} placeholder="Moonlit Mehfil" />
                </label>
                <label className="sm:col-span-2">
                  <span className="theme-muted text-sm font-black">Description</span>
                  <textarea className={`${inputClass} resize-none`} rows={4} placeholder="A short note with a little personality." />
                </label>
                <label>
                  <span className="theme-muted text-sm font-black">Date</span>
                  <input type="date" className={inputClass} />
                </label>
                <label>
                  <span className="theme-muted text-sm font-black">Time</span>
                  <input type="time" className={inputClass} />
                </label>
                <label className="sm:col-span-2">
                  <span className="theme-muted text-sm font-black">Location</span>
                  <input className={inputClass} placeholder="The Courtyard Cafe, Delhi" />
                </label>
              </div>
            </section>

            <section className="theme-panel rounded-[2rem] border p-5 sm:p-7">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">mood selector</p>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
                {studioThemes.map((theme, index) => (
                  <button
                    key={theme.name}
                    type="button"
                    className={[
                      "focus-ring rounded-2xl border p-2 text-left transition hover:-translate-y-0.5",
                      index === 0 ? "border-lime-mute bg-black/20" : "border-[color:var(--border)] bg-[color:var(--card)]",
                    ].join(" ")}
                  >
                    <span className={`block h-16 rounded-xl bg-gradient-to-br ${theme.gradient}`} />
                    <span className="theme-heading mt-2 block text-sm font-black">{theme.name}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="theme-panel rounded-[2rem] border p-5 sm:p-7">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-electric">guest setup</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="theme-muted text-sm font-black">Capacity</span>
                  <input type="number" className={inputClass} placeholder="120" />
                </label>
                <label>
                  <span className="theme-muted text-sm font-black">UPI ID optional</span>
                  <input className={inputClass} placeholder="host@upi" />
                </label>
                <label className="sm:col-span-2">
                  <span className="theme-muted text-sm font-black">Payment note optional</span>
                  <input className={inputClass} placeholder="INR 499 at venue" />
                </label>
              </div>
            </section>

            <button type="button" className="focus-ring w-full rounded-2xl bg-lime-mute px-5 py-4 font-black text-zinc-950">
              Preview invite
            </button>
          </form>
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-4">
            <div className="film-grain relative min-h-[34rem] overflow-hidden rounded-[1.6rem] bg-[radial-gradient(circle_at_26%_16%,rgba(255,46,139,0.8),transparent_24%),radial-gradient(circle_at_75%_24%,rgba(198,255,69,0.28),transparent_18%),linear-gradient(135deg,#050505,#4b123a,#f97316)]">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
              <div className="absolute bottom-6 left-5 right-5">
                <span className="rounded-full bg-ivory px-3 py-1 text-xs font-black text-zinc-950">live preview</span>
                <h2 className="mt-4 text-5xl font-black lowercase leading-none text-white">Moonlit Mehfil</h2>
                <p className="mt-3 text-sm font-bold text-zinc-300">Delhi NCR · Sat night · host the room</p>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

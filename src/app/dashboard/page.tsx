import Link from "next/link";
import { HostChecklist } from "@/components/dashboard/host-checklist";
import { MomentumCard } from "@/components/dashboard/momentum-card";
import { PulseCard } from "@/components/dashboard/pulse-card";
import { RecentRsvps } from "@/components/dashboard/recent-rsvps";
import { EventCard } from "@/components/discovery/event-card";
import { AnimatedInviteCard } from "@/components/invite/animated-invite-card";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { dashboardStats, demoEvent, hostEvents, recentActivity } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <main className="dark-stage min-h-screen overflow-x-hidden text-foreground">
      <header className="border-b border-[color:var(--border)] bg-[color:var(--background)]/72 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="min-w-0 text-2xl font-black lowercase text-[color:var(--foreground)]">Sama</Link>
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/dashboard/events/new" className="focus-ring theme-action rounded-full px-4 py-2 text-sm font-black">
              Create event
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="film-grain relative overflow-hidden rounded-[2.4rem] bg-[radial-gradient(circle_at_20%_10%,rgba(255,46,139,0.38),transparent_25%),linear-gradient(135deg,#111,#281326,#050505)] p-7 shadow-[0_24px_90px_rgba(0,0,0,0.48)] sm:p-10">
          <div className="relative">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
              your events, your crowd, your city
            </p>
            <h1 className="mt-3 max-w-4xl text-5xl font-black lowercase leading-none text-white sm:text-7xl">
              good evening, aarav.
            </h1>
            <p className="mt-4 max-w-2xl text-lg font-semibold leading-8 text-zinc-300">
              Host the room, send the link, watch the guest list wake up.
            </p>
          </div>
        </div>

        <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardStats.map((stat) => (
            <article key={stat.label} className="theme-panel min-w-0 rounded-[1.5rem] border p-5">
              <p className="theme-muted text-sm font-black uppercase tracking-[0.14em]">{stat.label}</p>
              <p className="theme-heading mt-3 text-4xl font-black">{stat.value}</p>
              <p className="mt-2 text-sm font-bold text-lime-mute">{stat.detail}</p>
            </article>
          ))}
        </div>

        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-6">
            <section className="min-w-0">
              <div className="mb-4 flex min-w-0 flex-col items-start justify-between gap-2 sm:flex-row sm:items-end sm:gap-4">
                <h2 className="theme-heading min-w-0 text-4xl font-black lowercase">upcoming events</h2>
                <Link href="/invite/demo" className="shrink-0 text-sm font-black text-lime-mute">open demo</Link>
              </div>
              <div className="min-w-0 max-w-full overflow-hidden">
                <div className="scroll-row flex max-w-full gap-4 overflow-x-auto px-1 pb-8 pt-3">
                  {hostEvents.map((event) => (
                    <EventCard key={event.title} event={event} size="dashboard" />
                  ))}
                </div>
              </div>
            </section>

            <section className="min-w-0">
              <div className="mb-4">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
                  today&apos;s pulse
                </p>
                <h2 className="theme-heading mt-2 text-4xl font-black lowercase">live room signals</h2>
              </div>
              <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
                <PulseCard label="new RSVPs today" value="18" accent="lime" />
                <PulseCard label="WhatsApp shares" value="7" accent="rose" />
                <PulseCard label="guests checked in" value="3" accent="blue" />
                <PulseCard label="pending nudges" value="2" accent="saffron" />
              </div>
            </section>

            <section className="grid min-w-0 gap-4 lg:grid-cols-2">
              <MomentumCard />
              <div className="grid min-w-0 gap-4">
                <HostChecklist />
                <RecentRsvps />
              </div>
            </section>

            <section className="min-w-0">
              <div className="mb-4">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">
                  featured invite preview
                </p>
                <h2 className="theme-heading mt-2 text-4xl font-black lowercase">
                  tonight&apos;s room card
                </h2>
              </div>
              <AnimatedInviteCard
                title={demoEvent.title}
                date={demoEvent.date}
                time={demoEvent.time}
                host={demoEvent.host}
                location={demoEvent.location}
                description="A compact preview of the invite your guests will open and share."
                guests={demoEvent.guests.slice(0, 4).map((guest) => guest.name.slice(0, 2).toUpperCase())}
                theme="afterdark"
                compact
              />
            </section>
          </div>

          <aside className="min-w-0 space-y-4 xl:sticky xl:top-6 xl:self-start">
            <section className="theme-panel min-w-0 rounded-[2rem] border p-5">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">quick actions</p>
              <div className="mt-4 grid gap-3">
                {["Copy invite link", "Send WhatsApp nudge", "Open guest list"].map((action) => (
                  <button key={action} type="button" className="focus-ring rounded-2xl bg-black/35 px-4 py-4 text-left font-black text-white hover:bg-white/10">
                    {action}
                  </button>
                ))}
              </div>
            </section>
            <section className="theme-panel min-w-0 rounded-[2rem] border p-5">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">activity feed</p>
              <div className="mt-4 space-y-3">
                {recentActivity.map((item) => (
                  <p key={item} className="rounded-2xl bg-black/35 px-4 py-3 text-sm font-bold text-zinc-300">
                    {item}
                  </p>
                ))}
              </div>
            </section>
            <section className="min-w-0 rounded-[2rem] border border-white/10 bg-lime-mute p-5 text-zinc-950">
              <p className="text-sm font-black uppercase tracking-[0.18em]">invite links</p>
              <h3 className="mt-3 text-2xl font-black lowercase">one link, whole room.</h3>
              <p className="mt-2 text-sm font-bold">Share on WhatsApp, stories, or the group chat.</p>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

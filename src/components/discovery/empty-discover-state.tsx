import Link from "next/link";

export function EmptyDiscoverState() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="film-grain relative overflow-hidden rounded-[2.25rem] border border-[color:var(--border)] bg-[radial-gradient(circle_at_22%_18%,rgba(255,46,139,0.28),transparent_24%),linear-gradient(135deg,rgba(0,0,0,0.72),rgba(198,255,69,0.08))] p-7 sm:p-10">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
          no gatherings found
        </p>
        <h2 className="theme-heading mt-3 max-w-2xl text-5xl font-black lowercase leading-none">
          this scene is waiting for a host
        </h2>
        <p className="theme-muted mt-4 max-w-xl font-semibold leading-7">
          Try another city or category, or open the room yourself.
        </p>
        <Link
          href="/dashboard/events/new"
          className="focus-ring mt-6 inline-flex rounded-full bg-lime-mute px-6 py-4 font-black text-zinc-950 transition hover:-translate-y-0.5"
        >
          Host one
        </Link>
      </div>
    </section>
  );
}

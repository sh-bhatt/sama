import Link from "next/link";

type EventCardProps = {
  title: string;
  date: string;
  location: string;
  rsvps: string;
  status: string;
};

export function EventCard({ title, date, location, rsvps, status }: EventCardProps) {
  return (
    <article className="tilt-card overflow-hidden rounded-[1.75rem] border border-plum-950/10 bg-white p-4 shadow-soft">
      <div className="grid gap-4 sm:grid-cols-[9rem_1fr]">
        <div className="relative min-h-36 rounded-[1.35rem] bg-[radial-gradient(circle_at_22%_20%,#f8cbd4_0,#f8cbd4_18%,transparent_19%),linear-gradient(135deg,#4d1734,#e96f62,#f3b45b)] p-4 text-zinc-950">
          <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-bold">{date}</span>
          <p className="absolute bottom-4 left-4 right-4 text-lg font-semibold leading-tight">{title}</p>
        </div>
        <div className="flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-charcoal">{title}</h3>
          <p className="mt-2 text-sm text-charcoal/60">
            {date} · {location}
          </p>
        </div>
        <span className="animate-soft-pulse rounded-full bg-peach-100 px-3 py-1 text-xs font-bold text-plum-900">
          {status}
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-ivory px-3 py-1.5 text-sm font-semibold text-charcoal">
          {rsvps}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-full border border-plum-950/10 px-4 py-2 text-sm font-semibold text-charcoal transition hover:border-plum-900/30"
          >
            Copy link
          </button>
          <Link
            href="/invite/demo"
            className="rounded-full bg-plum-900 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-plum-800"
          >
            Manage
          </Link>
        </div>
      </div>
        </div>
      </div>
    </article>
  );
}

import Link from "next/link";
import { formatDateTimeLabel } from "@/lib/date";
import { getPosterVariant } from "@/lib/discover";

type OrganizerEvent = {
  id: string;
  title: string;
  slug: string;
  eventDate: Date;
  eventTime: string;
  location: string;
  city: string | null;
  category: string | null;
  theme: string;
  coverImage: string | null;
  capacity: number | null;
  requiresApproval: boolean;
  waitlistEnabled: boolean;
  _count: {
    interests: number;
    rsvps: number;
  };
};

export function OrganizerEventCard({ event }: { event: OrganizerEvent }) {
  return (
    <Link
      href={`/invite/${event.slug}`}
      className="tilt-card group min-w-0 overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-900 shadow-[0_22px_70px_rgba(0,0,0,0.38)]"
    >
      <div className={`film-grain relative min-h-48 bg-gradient-to-br ${getPosterVariant(event)} p-5`}>
        {event.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.coverImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-75" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/16 to-transparent" />
        <div className="relative flex flex-wrap gap-2">
          <span className="rounded-full bg-ivory px-3 py-1 text-xs font-black text-zinc-950">
            {event.category || "Social"}
          </span>
          {event.requiresApproval && (
            <span className="rounded-full bg-black/55 px-3 py-1 text-xs font-black text-lime-200">
              approval
            </span>
          )}
        </div>
        <h3 className="absolute bottom-5 left-5 right-5 text-3xl font-black lowercase leading-none text-white">
          {event.title}
        </h3>
      </div>
      <div className="space-y-3 p-5">
        <p className="text-sm font-black text-zinc-200">
          {formatDateTimeLabel(event.eventDate, event.eventTime)}
        </p>
        <p className="text-sm font-semibold text-zinc-400">
          {event.city ? `${event.city} - ` : ""}
          {event.location}
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-white/8 px-3 py-1.5 text-xs font-black text-lime-200">
            {event._count.rsvps}
            {event.capacity ? `/${event.capacity}` : ""} RSVPs
          </span>
          <span className="rounded-full bg-white/8 px-3 py-1.5 text-xs font-black text-zinc-200">
            {event._count.interests} interested
          </span>
          {event.waitlistEnabled && (
            <span className="rounded-full bg-white/8 px-3 py-1.5 text-xs font-black text-rose-200">
              waitlist ready
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

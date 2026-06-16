import Link from "next/link";
import { getCardDesignStyles } from "@/lib/card-design";
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
  cardDesign?: unknown;
  capacity: number | null;
  requiresApproval: boolean;
  waitlistEnabled: boolean;
  _count: {
    interests: number;
    rsvps: number;
  };
};

export function OrganizerEventCard({ event }: { event: OrganizerEvent }) {
  const designStyles = getCardDesignStyles(event.cardDesign);

  return (
    <Link
      href={`/invite/${event.slug}`}
      className={`tilt-card group min-w-0 overflow-hidden border border-zinc-950/10 bg-white/78 shadow-[0_22px_70px_rgba(77,23,52,0.16)] ${designStyles.cornerClass}`}
      style={designStyles.style}
    >
      <div className={`film-grain relative min-h-48 bg-gradient-to-br ${getPosterVariant(event)} p-5`}>
        {event.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.coverImage}
            alt={`Cover image for ${event.title}`}
            className={`absolute inset-0 h-full w-full opacity-75 ${designStyles.imageClass}`}
          />
        )}
        <div className={`absolute inset-0 ${designStyles.overlayClass}`} />
        {designStyles.textureClass && <div className={`absolute inset-0 ${designStyles.textureClass}`} />}
        <div className="relative flex flex-wrap gap-2">
          <span className={`${designStyles.badgeClass} text-zinc-950`} style={designStyles.accentBackgroundStyle}>
            {event.category || "Social"}
          </span>
          {event.requiresApproval && (
            <span className="rounded-full bg-white/72 px-3 py-1 text-xs font-black text-zinc-950">
              approval
            </span>
          )}
        </div>
        <h3 className={`absolute bottom-5 left-5 right-5 text-3xl lowercase leading-none ${designStyles.fontClass}`} style={designStyles.titleStyle}>
          {event.title}
        </h3>
      </div>
      <div className="space-y-3 p-5">
        <p className="text-sm font-black text-zinc-900">
          {formatDateTimeLabel(event.eventDate, event.eventTime)}
        </p>
        <p className="text-sm font-semibold text-zinc-600">
          {event.city ? `${event.city} - ` : ""}
          {event.location}
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-lime-600/20 bg-lime-200/70 px-3 py-1.5 text-xs font-black text-zinc-950">
            {event._count.rsvps}
            {event.capacity ? `/${event.capacity}` : ""} RSVPs
          </span>
          <span className="rounded-full border border-zinc-950/10 bg-white/58 px-3 py-1.5 text-xs font-black text-zinc-700">
            {event._count.interests} interested
          </span>
          {event.waitlistEnabled && (
            <span className="rounded-full border border-rose-500/20 bg-rose-100/70 px-3 py-1.5 text-xs font-black text-rose-700">
              waitlist ready
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

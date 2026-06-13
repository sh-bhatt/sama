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
      className={`tilt-card group min-w-0 overflow-hidden border border-white/10 bg-zinc-900 shadow-[0_22px_70px_rgba(0,0,0,0.38)] ${designStyles.cornerClass}`}
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
            <span className="rounded-full bg-black/55 px-3 py-1 text-xs font-black text-lime-200">
              approval
            </span>
          )}
        </div>
        <h3 className={`absolute bottom-5 left-5 right-5 text-3xl lowercase leading-none ${designStyles.fontClass}`} style={designStyles.titleStyle}>
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

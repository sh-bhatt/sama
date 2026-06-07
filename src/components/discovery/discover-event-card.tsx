import Link from "next/link";
import { InterestButton } from "@/components/discovery/interest-button";
import { formatDateTimeLabel } from "@/lib/date";
import {
  getApprovedGoingCount,
  getHostLabel,
  getPosterVariant,
  type PublicDiscoveryEvent,
} from "@/lib/discover";
import { getOrganizerHref } from "@/lib/profile";
import { cn } from "@/lib/utils";

export function DiscoverEventCard({
  event,
  wide = false,
}: {
  event: PublicDiscoveryEvent;
  wide?: boolean;
}) {
  const interestedCount = event._count.interests;
  const goingCount = getApprovedGoingCount(event);
  const hostLabel = getHostLabel(event);
  const organizerHref = getOrganizerHref(event.host);

  return (
    <article
      className={cn(
        "tilt-card group relative min-w-0 shrink-0 overflow-hidden rounded-[1.6rem] border border-white/10 bg-zinc-900 shadow-[0_22px_70px_rgba(0,0,0,0.38)]",
        wide ? "w-[min(86vw,24rem)]" : "w-[min(82vw,20rem)]",
      )}
    >
      <Link href={`/invite/${event.slug}`} className="block">
        <div
          className={cn(
            "film-grain poster-mesh relative h-60 overflow-hidden bg-gradient-to-br",
            getPosterVariant(event),
          )}
        >
          {event.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.coverImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-78"
            />
          )}
          <div className="poster-orb absolute -left-10 top-6 size-36 rounded-full bg-white/28 blur-2xl" />
          <div className="poster-orb absolute bottom-8 right-0 size-32 rounded-full bg-lime-mute/30 blur-2xl [animation-delay:900ms]" />
          <div className="gradient-drift absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(255,255,255,0.32),transparent_18%),radial-gradient(circle_at_78%_24%,rgba(255,255,255,0.2),transparent_20%),linear-gradient(to_top,rgba(0,0,0,0.72),rgba(0,0,0,0.06)_58%)]" />
          <div className="poster-shine pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0" />
          <div className="absolute left-4 right-4 top-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-ivory px-3 py-1 text-xs font-black text-zinc-950">
              {event.category || "Social"}
            </span>
            {event.requiresApproval && (
              <span className="rounded-full bg-black/55 px-3 py-1 text-xs font-black text-lime-200 backdrop-blur">
                approval
              </span>
            )}
            {event.waitlistEnabled && event.capacity && goingCount >= event.capacity && (
              <span className="rounded-full bg-rose-neon/80 px-3 py-1 text-xs font-black text-white">
                waitlist
              </span>
            )}
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-2xl font-black leading-none text-white">{event.title}</h3>
            <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-lime-200">
              by {hostLabel}
            </p>
          </div>
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <p className="text-sm font-bold text-zinc-200">
          {formatDateTimeLabel(event.eventDate, event.eventTime)}
        </p>
        <p className="text-sm text-zinc-400">
          {event.city || "India"} - {event.location}
        </p>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
          hosted by{" "}
          {organizerHref ? (
            <Link href={organizerHref} className="text-lime-200 transition hover:text-lime-mute">
              {hostLabel}
            </Link>
          ) : (
            <span className="text-lime-200">{hostLabel}</span>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-white/8 px-3 py-1.5 text-xs font-black text-lime-200">
            {goingCount}
            {event.capacity ? `/${event.capacity}` : ""} going
          </span>
          <span className="rounded-full bg-white/8 px-3 py-1.5 text-xs font-black text-zinc-200">
            {interestedCount} interested
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <InterestButton eventId={event.id} initialCount={interestedCount} compact />
          <Link
            href={`/invite/${event.slug}`}
            className="focus-ring rounded-full bg-white/8 px-3 py-2 text-xs font-black text-white transition hover:-translate-y-0.5 hover:bg-white/12"
          >
            RSVP
          </Link>
        </div>
      </div>
    </article>
  );
}

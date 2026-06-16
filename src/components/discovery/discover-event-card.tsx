import Link from "next/link";
import { InterestButton } from "@/components/discovery/interest-button";
import { getCardDesignStyles } from "@/lib/card-design";
import { formatDateTimeLabel } from "@/lib/date";
import { getDerivedEventStatus, getEventLifecycleLabel } from "@/lib/event-lifecycle";
import {
  getApprovedGoingCount,
  getHostInitials,
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
  const hostInitials = getHostInitials(event);
  const organizerHref = getOrganizerHref(event.host);
  const designStyles = getCardDesignStyles(event.cardDesign);
  const lifecycleStatus = getDerivedEventStatus(event);
  const lifecycleLabel = getEventLifecycleLabel(event);
  const hostAvatar = (
    <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full border border-zinc-950/10 bg-ivory text-xs font-black text-zinc-950 shadow-[0_10px_28px_rgba(77,23,52,0.16)]">
      {event.host.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={event.host.imageUrl}
          alt={`${hostLabel} profile photo`}
          className="h-full w-full object-cover"
        />
      ) : (
        hostInitials
      )}
    </span>
  );
  const hostLinkContent = (
    <>
      {hostAvatar}
      <span className="min-w-0">
        <span className="block text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
          hosted by
        </span>
        <span className="block truncate text-sm font-black text-zinc-950">
          {hostLabel}
        </span>
      </span>
    </>
  );

  return (
    <article
      className={cn(
        "tilt-card group relative min-w-0 shrink-0 overflow-hidden border border-zinc-950/10 bg-white/78 shadow-[0_22px_70px_rgba(77,23,52,0.16)] backdrop-blur",
        designStyles.cornerClass,
        wide ? "w-[min(86vw,24rem)]" : "w-[min(82vw,20rem)]",
      )}
      style={designStyles.style}
    >
      <Link href={`/invite/${event.slug}`} className="block" aria-label={`Open invite for ${event.title}`}>
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
              alt={`Cover image for ${event.title}`}
              className={cn("absolute inset-0 h-full w-full opacity-78", designStyles.imageClass)}
            />
          )}
          <div className="poster-orb absolute -left-10 top-6 size-36 rounded-full bg-white/28 blur-2xl" />
          <div className="poster-orb absolute bottom-8 right-0 size-32 rounded-full bg-lime-mute/30 blur-2xl [animation-delay:900ms]" />
          <div className={cn("absolute inset-0", designStyles.overlayClass)} />
          {designStyles.textureClass && <div className={cn("absolute inset-0", designStyles.textureClass)} />}
          <div className="poster-shine pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0" />
          <div className="absolute left-4 right-4 top-4 flex flex-wrap gap-2">
            <span className={cn(designStyles.badgeClass, "text-zinc-950")} style={designStyles.accentBackgroundStyle}>
              {event.category || "Social"}
            </span>
            <span
              className={cn(
                designStyles.badgeClass,
                lifecycleStatus === "live"
                  ? "bg-lime-mute text-zinc-950"
                  : lifecycleStatus === "ended"
                    ? "bg-white/72 text-zinc-700"
                    : "bg-white/72 text-zinc-950 backdrop-blur",
              )}
            >
              {lifecycleLabel}
            </span>
            {event.requiresApproval && (
              <span className="rounded-full bg-white/72 px-3 py-1 text-xs font-black text-zinc-950 backdrop-blur">
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
            <h3 className={cn("text-2xl leading-none", designStyles.fontClass)} style={designStyles.titleStyle}>{event.title}</h3>
            <p className="mt-2 text-xs font-black uppercase tracking-[0.14em]" style={designStyles.accentStyle}>
              by {hostLabel}
            </p>
          </div>
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <p className="text-sm font-bold text-zinc-900">
          {formatDateTimeLabel(event.eventDate, event.eventTime)}
        </p>
        <p className="text-sm text-zinc-600">
          {event.city || "India"} - {event.location}
        </p>
        {organizerHref ? (
          <Link
            href={organizerHref}
            className="focus-ring flex min-w-0 items-center gap-2 rounded-2xl border border-zinc-950/10 bg-white/58 px-3 py-2 transition hover:bg-white/80"
          >
            {hostLinkContent}
          </Link>
        ) : (
          <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-zinc-950/10 bg-white/58 px-3 py-2">
            {hostLinkContent}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-lime-600/20 bg-lime-200/70 px-3 py-1.5 text-xs font-black text-zinc-950">
            {goingCount}
            {event.capacity ? `/${event.capacity}` : ""} going
          </span>
          <span className="rounded-full border border-zinc-950/10 bg-white/58 px-3 py-1.5 text-xs font-black text-zinc-700">
            {interestedCount} interested
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <InterestButton eventId={event.id} initialCount={interestedCount} compact />
          <Link
            href={`/invite/${event.slug}`}
            className="focus-ring rounded-full bg-lime-mute px-3 py-2 text-xs font-black text-zinc-950 transition hover:-translate-y-0.5 hover:brightness-105"
          >
            RSVP
          </Link>
        </div>
      </div>
    </article>
  );
}

import Link from "next/link";
import { cookies, headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { PublicBroadcasts } from "@/components/broadcasts/public-broadcasts";
import { CopyLinkButton } from "@/components/copy-link-button";
import { EventCoverPoster } from "@/components/events/event-cover-poster";
import { EventOwnerRail } from "@/components/events/event-owner-rail";
import { RsvpDrawer } from "@/components/invite/rsvp-drawer";
import { MemoriesTeaser } from "@/components/memories/memories-teaser";
import { PublicDatePoll } from "@/components/polls/public-date-poll";
import { RealtimeRefresh } from "@/components/realtime/realtime-refresh";
import { ShareWhatsAppButton } from "@/components/share-whatsapp-button";
import { isClerkConfigured, isDatabaseConfigured } from "@/lib/auth/config";
import { createGoogleCalendarUrl } from "@/lib/calendar";
import { formatEventDate } from "@/lib/date";
import {
  canGuestsRsvp,
  canGuestsUploadMemories,
  canGuestsVotePoll,
  getDerivedEventStatus,
  getEventLifecycleLabel,
  getEventTiming,
} from "@/lib/event-lifecycle";
import { getDisplayName, getOrganizerHref } from "@/lib/profile";
import { prisma } from "@/lib/prisma";
import { eventChannel, inviteChannel } from "@/lib/realtime/events";
import { rsvpAccessCookieName } from "@/lib/rsvp-access";
import { createWhatsAppShareUrl } from "@/lib/whatsapp";

type InvitePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

function HostIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 shrink-0 sm:size-[18px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9">
      <path d="M18 20a6 6 0 0 0-12 0" />
      <circle cx="12" cy="10" r="4" />
      <path d="m16.5 4.5 1.2 1.2 2.3-2.4" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 shrink-0 sm:size-[18px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9">
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function SpotsIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 shrink-0 sm:size-[18px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9">
      <path d="M16 21v-2a4 4 0 0 0-8 0v2" />
      <circle cx="12" cy="11" r="4" />
      <path d="M19 8v5" />
      <path d="M21.5 10.5h-5" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <path d="M14 4h6v6" />
      <path d="m10 14 10-10" />
      <path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <rect width="14" height="10" x="5" y="11" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function LockedPreview({ title, body }: { title: string; body: string }) {
  return (
    <section className="border-t border-zinc-950/10 pt-6">
      <div className="flex max-w-xl items-start gap-3 text-zinc-700">
        <span className="mt-0.5 rounded-full bg-white/35 p-2 text-zinc-950 backdrop-blur">
          <LockIcon />
        </span>
        <div>
          <h2 className="text-xl font-black lowercase text-zinc-950">{title}</h2>
          <p className="mt-1 text-sm font-semibold leading-6">{body}</p>
          <a href="#rsvp-panel" className="focus-ring mt-3 inline-flex rounded-full bg-lime-mute px-4 py-2 text-sm font-black text-zinc-950">
            RSVP to unlock
          </a>
        </div>
      </div>
    </section>
  );
}

function formatInviteDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatClockTime(totalMinutes: number) {
  const minutesInDay = 24 * 60;
  const normalized = ((totalMinutes % minutesInDay) + minutesInDay) % minutesInDay;
  const hour24 = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const period = hour24 >= 12 ? "pm" : "am";
  const hour12 = hour24 % 12 || 12;

  return `${hour12}:${minute.toString().padStart(2, "0")}${period}`;
}

function parseTimeToMinutes(time: string) {
  const [hourValue, minuteValue = "0"] = time.split(":");
  const hour = Number(hourValue);
  const minute = Number(minuteValue);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  return hour * 60 + minute;
}

function formatInviteTimeRange(event: {
  eventDate: Date;
  eventTime: string;
  startsAt?: Date | null;
  endsAt?: Date | null;
}) {
  const startMinutes = parseTimeToMinutes(event.eventTime);

  if (startMinutes === null) {
    return event.eventTime;
  }

  const startLabel = formatClockTime(startMinutes);
  const { startsAt, endsAt } = getEventTiming(event);

  if (!startsAt || !endsAt) {
    return startLabel;
  }

  const durationMinutes = Math.round((endsAt.getTime() - startsAt.getTime()) / 60000);

  if (durationMinutes <= 0) {
    return startLabel;
  }

  return `${startLabel} – ${formatClockTime(startMinutes + durationMinutes)}`;
}

function InviteNotFound() {
  return (
    <main className="app-surface min-h-screen overflow-x-hidden px-4 py-6 text-foreground sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="theme-panel rounded-[2rem] border p-6 sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">
            invite not found
          </p>
          <h1 className="theme-heading mt-3 text-4xl font-black lowercase">
            this room is not open
          </h1>
          <p className="theme-muted mt-4 font-semibold leading-7">
            The link may have changed, or the host may have deleted the invite.
          </p>
          <Link href="/" className="focus-ring theme-action mt-6 inline-flex rounded-full px-5 py-3 font-black">
            Back to discovery
          </Link>
        </div>
      </div>
    </main>
  );
}

function InviteDatabaseError() {
  return (
    <main className="app-surface min-h-screen overflow-x-hidden px-4 py-6 text-foreground sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="theme-panel rounded-[2rem] border p-6 sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">
            invite temporarily unavailable
          </p>
          <h1 className="theme-heading mt-3 text-4xl font-black lowercase">
            the room needs a refresh
          </h1>
          <p className="theme-muted mt-4 font-semibold leading-7">
            Sama could not reach the event database just now. Try again in a moment.
          </p>
          <Link href="/" className="focus-ring theme-action mt-6 inline-flex rounded-full px-5 py-3 font-black">
            Back to discovery
          </Link>
        </div>
      </div>
    </main>
  );
}

export default async function InvitePage({ params }: InvitePageProps) {
  if (!isDatabaseConfigured()) {
    return (
      <main className="app-surface min-h-screen overflow-x-hidden px-4 py-6 text-foreground sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="theme-panel rounded-[2rem] border p-6 sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
              database setup needed
            </p>
            <h1 className="theme-heading mt-3 text-4xl font-black lowercase">
              connect Neon to open live invites
            </h1>
            <p className="theme-muted mt-4 font-semibold leading-7">
              Live invite links need DATABASE_URL. You can still browse public event discovery.
            </p>
            <Link href="/discover" className="focus-ring theme-action mt-6 inline-flex rounded-full px-5 py-3 font-black">
              Browse discover
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { slug } = await params;
  const eventResult = await prisma.event
    .findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        eventDate: true,
        eventTime: true,
        location: true,
        theme: true,
        city: true,
        category: true,
        coverImage: true,
        cardDesign: true,
        visibility: true,
        status: true,
        startsAt: true,
        endsAt: true,
        endedAt: true,
        cancelledAt: true,
        archivedAt: true,
        capacity: true,
        requiresApproval: true,
        waitlistEnabled: true,
        upiId: true,
        paymentNote: true,
        host: {
          select: {
            clerkId: true,
            name: true,
            username: true,
            imageUrl: true,
            bio: true,
            location: true,
            instagramUrl: true,
            websiteUrl: true,
            publicProfile: true,
          },
        },
        rsvps: {
          where: { approvalStatus: "APPROVED" },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            status: true,
            approvalStatus: true,
            plusOne: true,
          },
        },
        activities: {
          where: { type: { in: ["RSVP_CREATED", "RSVP_UPDATED"] } },
          orderBy: { createdAt: "desc" },
          take: 4,
          select: { id: true, message: true },
        },
        datePolls: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            question: true,
            options: {
              orderBy: { optionDate: "asc" },
              select: {
                id: true,
                optionDate: true,
                label: true,
                _count: { select: { votes: true } },
              },
            },
          },
        },
        infoBlocks: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: {
            id: true,
            type: true,
            title: true,
            content: true,
            url: true,
          },
        },
        rsvpQuestions: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: {
            id: true,
            type: true,
            question: true,
            options: true,
            required: true,
          },
        },
        memoryPhotos: {
          where: { approved: true },
          orderBy: { createdAt: "desc" },
          take: 6,
          select: {
            id: true,
            imageUrl: true,
            caption: true,
          },
        },
        broadcasts: {
          where: { audience: "ALL" },
          orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
          take: 5,
          select: {
            id: true,
            title: true,
            message: true,
            pinned: true,
            createdAt: true,
          },
        },
      },
    })
    .then((event) => ({ status: "ready" as const, event }))
    .catch((error) => {
      console.warn("Invite data load failed:", error);
      return { status: "database-error" as const, event: null };
    });

  if (eventResult.status === "database-error") {
    return <InviteDatabaseError />;
  }

  const event = eventResult.event;

  if (!event) {
    return <InviteNotFound />;
  }

  const viewerUserId = isClerkConfigured() ? (await auth()).userId : null;
  const isOwner = Boolean(viewerUserId && event.host.clerkId === viewerUserId);
  const accessCookie = (await cookies()).get(rsvpAccessCookieName(event.id))?.value;
  const hasRsvpAccess =
    isOwner ||
    Boolean(
      accessCookie &&
        (await prisma.rSVP.findFirst({
          where: { id: accessCookie, eventId: event.id },
          select: { id: true },
        })),
    );
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") || "http";
  const origin = host ? `${protocol}://${host}` : "http://localhost:3000";
  const inviteUrl = `${origin}/invite/${event.slug}`;
  const whatsappUrl = createWhatsAppShareUrl(event.title, inviteUrl);
  const googleCalendarUrl = createGoogleCalendarUrl(event, inviteUrl);
  const icsUrl = `/api/events/${event.id}/calendar`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`;
  const dateLabel = formatEventDate(event.eventDate);
  const inviteDateLabel = formatInviteDate(event.eventDate);
  const inviteTimeLabel = formatInviteTimeRange(event);
  const hostName = getDisplayName(event.host);
  const lifecycleStatus = getDerivedEventStatus(event);
  const lifecycleLabel = getEventLifecycleLabel(event);
  const guestsCanRsvp = canGuestsRsvp(event);
  const guestsCanVotePoll = canGuestsVotePoll(event);
  const guestsCanUploadMemories = canGuestsUploadMemories(event);
  const lifecycleCopy = {
    upcoming: null,
    live: "Happening now. Keep the invite handy for location and updates.",
    ended: "This event has ended. Memories are now the main room.",
    cancelled: "This event was cancelled by the host.",
    archived: "This room is archived and read-only.",
  }[lifecycleStatus];
  const organizerHref = getOrganizerHref(event.host);
  const hostInitials = hostName.slice(0, 2).toUpperCase();
  const publicRsvps = event.rsvps.filter((rsvp) => rsvp.approvalStatus === "APPROVED");
  const goingGuests = publicRsvps
    .filter((rsvp) => rsvp.status === "GOING")
    .slice(0, 8)
    .map((rsvp) => ({
      id: rsvp.id,
      name: rsvp.name,
      status: rsvp.status,
      plusOne: rsvp.plusOne,
    }));
  const goingCount = publicRsvps.filter((rsvp) => rsvp.status === "GOING").length;
  const goingFull = Boolean(event.capacity && goingCount >= event.capacity);
  const spotsLeft = event.capacity ? Math.max(event.capacity - goingCount, 0) : null;
  const poll = event.datePolls[0];
  const pollOptions =
    poll?.options.map((option) => ({
      id: option.id,
      optionDate: option.optionDate,
      label: option.label,
      votes: option._count.votes,
    })) || [];
  const locationLabel = hasRsvpAccess
    ? event.location
    : event.city
      ? `${event.city} · RSVP to unlock the full location.`
      : "RSVP to unlock the full location.";
  const shouldShowMemories = guestsCanUploadMemories || event.memoryPhotos.length > 0 || lifecycleStatus === "ended";
  const hasMeaningfulActivity = event.activities.length > 0;
  const waitlistCopy = event.waitlistEnabled && event.capacity ? "Waitlist opens if the room fills." : null;

  return (
    <main className="event-canvas relative min-h-screen overflow-x-hidden pb-28 text-zinc-950 lg:pb-0">
      {event.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={event.coverImage}
          alt=""
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 h-full w-full object-cover opacity-10 blur-3xl saturate-150"
        />
      )}
      <div className="pointer-events-none fixed inset-0 noise-overlay opacity-50" />

      <header className="relative z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="focus-ring rounded-full bg-white/45 px-4 py-2 text-lg font-black lowercase text-zinc-950 backdrop-blur">
            Sama
          </Link>
          <nav className="flex min-w-0 items-center gap-1 sm:gap-2">
            <Link href={viewerUserId ? "/dashboard/events/new" : "/sign-in"} className="focus-ring rounded-full bg-white/38 px-3 py-2 text-sm font-black text-zinc-950 backdrop-blur sm:px-4">
              Create
            </Link>
            <Link href="/discover" className="focus-ring hidden rounded-full bg-white/32 px-4 py-2 text-sm font-black text-zinc-950 backdrop-blur sm:inline-flex">
              Discover
            </Link>
            <Link href={viewerUserId ? "/dashboard" : "/sign-in"} className="focus-ring rounded-full bg-lime-mute px-3 py-2 text-sm font-black text-zinc-950 sm:px-4">
              {viewerUserId ? "Dashboard" : "Login"}
            </Link>
          </nav>
        </div>
      </header>

      {isOwner && <EventOwnerRail eventId={event.id} />}

      <RealtimeRefresh
        channels={[inviteChannel(event.slug), eventChannel(event.id)]}
        enabled={Boolean(process.env.ABLY_API_KEY)}
        showIndicator={false}
        clerkUserId={viewerUserId}
      />

      <section className="relative z-10 mx-auto grid max-w-5xl gap-7 px-4 pb-8 pt-3 sm:px-6 lg:min-h-[calc(100vh-5.25rem)] lg:grid-cols-[minmax(0,0.9fr)_minmax(300px,0.86fr)] lg:items-center lg:gap-10 lg:px-8 lg:pb-12 lg:pt-6">
        <div className="min-w-0 self-center">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-lime-mute px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-950">
              {lifecycleLabel}
            </span>
            {event.visibility === "private" && (
              <span className="rounded-full bg-white/38 px-4 py-2 text-xs font-black text-zinc-800 backdrop-blur">
                private link
              </span>
            )}
          </div>

          <h1 className="text-shadow-soft mt-6 max-w-3xl text-4xl font-black lowercase leading-[0.92] tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
            {event.title}
          </h1>
          <div className="mt-6">
            <p className="text-xl font-black leading-tight text-zinc-950 sm:text-2xl lg:text-[1.7rem]">
              {inviteDateLabel}
            </p>
            <p className="mt-1 text-lg font-bold leading-tight text-zinc-700 sm:text-xl">
              {inviteTimeLabel}
            </p>
          </div>

          <div className="mt-6 max-w-lg space-y-2.5">
            <div className="grid grid-cols-[4.4rem_minmax(0,1fr)] gap-3 border-b border-zinc-950/10 pb-2.5">
              <p className="flex items-center gap-2 text-sm font-black text-zinc-600">
                <LocationIcon />
                Where
              </p>
              <div>
                <p className="text-base font-black leading-6 text-zinc-950 sm:text-[1.05rem]">{locationLabel}</p>
                {hasRsvpAccess && (
                  <a href={mapsUrl} target="_blank" rel="noreferrer noopener" className="focus-ring mt-2 inline-flex rounded-full bg-white/35 px-3 py-1.5 text-xs font-black text-zinc-950 backdrop-blur transition hover:-translate-y-0.5">
                    Open in Maps
                  </a>
                )}
              </div>
            </div>
            <div className="grid grid-cols-[4.4rem_minmax(0,1fr)] gap-3 border-b border-zinc-950/10 pb-2.5 last:border-b-0">
              <p className="flex items-center gap-2 text-sm font-black text-zinc-600">
                <SpotsIcon />
                Spots
              </p>
              <p className="text-base font-black leading-6 text-zinc-950 sm:text-[1.05rem]">
                {spotsLeft === null ? "Open room" : `${spotsLeft}/${event.capacity} spots left`}
              </p>
            </div>
            {(event.requiresApproval || waitlistCopy) && (
              <p className="pt-1 text-sm font-bold text-zinc-700">
                {event.requiresApproval ? "Host approval is on." : waitlistCopy}
              </p>
            )}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-rose-neon to-lime-mute text-sm font-black text-zinc-950">
              {event.host.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={event.host.imageUrl} alt={`${hostName} profile photo`} className="h-full w-full object-cover" />
              ) : (
                hostInitials
              )}
            </div>
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-bold text-zinc-700">
                <HostIcon />
                Hosted by
              </p>
              {organizerHref ? (
                <Link href={organizerHref} className="focus-ring inline-flex rounded-full text-xl font-black lowercase text-zinc-950 underline-offset-4 hover:underline sm:text-2xl">
                  {hostName}
                </Link>
              ) : (
                <h2 className="text-xl font-black lowercase text-zinc-950 sm:text-2xl">{hostName}</h2>
              )}
            </div>
          </div>

          {event.description && (
            <p className="mt-6 max-w-xl text-base font-semibold leading-7 text-zinc-700 sm:text-lg">
              {event.description}
            </p>
          )}

          {hasRsvpAccess && goingGuests.length > 0 ? (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="-space-x-2">
                {goingGuests.slice(0, 5).map((guest) => (
                  <span
                    key={guest.id}
                    title={guest.name}
                    className="relative inline-grid size-8 place-items-center rounded-full border border-white/55 bg-gradient-to-br from-rose-neon to-lime-mute text-[0.68rem] font-black text-zinc-950 shadow-sm"
                  >
                    {guest.name.slice(0, 1).toUpperCase()}
                  </span>
                ))}
              </div>
              <span className="text-sm font-black text-zinc-700">
                {goingCount} going
              </span>
            </div>
          ) : hasRsvpAccess ? (
            guestsCanRsvp && (
              <p className="mt-5 text-sm font-semibold text-zinc-600">
                Be the first to say yes.
              </p>
            )
          ) : (
            <p className="mt-5 text-sm font-semibold text-zinc-600">
              {goingCount > 0 ? `${goingCount} going · RSVP to see who is in.` : "Be the first to say yes."}
            </p>
          )}

          {lifecycleCopy && (
            <p className="mt-5 max-w-xl text-sm font-semibold leading-6 text-zinc-600">
              {lifecycleCopy}
            </p>
          )}
        </div>

        <aside className="mx-auto w-full max-w-[26rem] min-w-0 space-y-3.5 lg:sticky lg:top-6 lg:self-start">
          <EventCoverPoster
            title={event.title}
            date={dateLabel}
            time={event.eventTime}
            host={hostName}
            location={hasRsvpAccess ? event.location : event.city || "Location unlocks after RSVP"}
            theme={event.theme}
            coverImage={event.coverImage}
            cardDesign={event.cardDesign}
          />
          <RsvpDrawer
            slug={event.slug}
            goingFull={goingFull}
            disabled={!guestsCanRsvp}
            closedLabel={
              lifecycleStatus === "ended"
                ? "This room has ended."
                : lifecycleStatus === "live"
                  ? "RSVPs are closed while the room is live."
                  : "RSVPs are closed."
            }
            questions={event.rsvpQuestions.map((question) => ({
              id: question.id,
              type: question.type,
              question: question.question,
              options: question.options,
              required: question.required,
            }))}
          />
          <details id="share-tools" className="px-1">
            <summary className="focus-ring mx-auto flex w-fit cursor-pointer list-none items-center gap-2 rounded-full bg-white/30 px-4 py-2 text-sm font-black text-zinc-950 backdrop-blur">
              <ShareIcon />
              Share
            </summary>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <CopyLinkButton value={inviteUrl} className="focus-ring rounded-full bg-white/40 px-4 py-2 text-sm font-black text-zinc-950 backdrop-blur transition hover:-translate-y-0.5" />
              <ShareWhatsAppButton href={whatsappUrl} label="WhatsApp" className="focus-ring rounded-full bg-[#25D366]/90 px-4 py-2 text-sm font-black text-zinc-950 transition hover:-translate-y-0.5" />
              {hasRsvpAccess ? (
                <>
                  <a href={googleCalendarUrl} target="_blank" rel="noreferrer noopener" className="focus-ring rounded-full bg-white/40 px-4 py-2 text-sm font-black text-zinc-950 backdrop-blur transition hover:-translate-y-0.5">
                    Calendar
                  </a>
                  <a href={icsUrl} className="focus-ring rounded-full bg-white/40 px-4 py-2 text-sm font-black text-zinc-950 backdrop-blur transition hover:-translate-y-0.5">
                    .ics
                  </a>
                </>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/24 px-4 py-2 text-sm font-black text-zinc-700 backdrop-blur">
                  <LockIcon />
                  Calendar unlocks after RSVP
                </span>
              )}
            </div>
          </details>
          {hasRsvpAccess && !guestsCanRsvp && guestsCanUploadMemories && (
            <Link href={`/invite/${event.slug}/memories`} className="focus-ring block rounded-full bg-lime-mute px-5 py-3 text-center font-black text-zinc-950">
              View memories
            </Link>
          )}
        </aside>
      </section>

      <section className="relative z-10 mx-auto max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="min-w-0 space-y-8">
          {hasRsvpAccess ? (
            <PublicBroadcasts broadcasts={event.broadcasts} />
          ) : (
            <LockedPreview title="updates unlock after RSVP" body="Join the room first, then host updates and room chatter open here." />
          )}

          {hasRsvpAccess && event.infoBlocks.length > 0 && (
            <section className="border-t border-zinc-950/10 pt-6">
              <h2 className="text-2xl font-black lowercase text-zinc-950">Details</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {event.infoBlocks.map((block) => (
                  <article key={block.id} className="border-l border-zinc-950/14 pl-4">
                    <p className="text-xs font-black text-rose-neon">{block.type.toLowerCase()}</p>
                    <h2 className="mt-2 text-xl font-black text-zinc-950">{block.title}</h2>
                    <p className="mt-2 text-sm font-semibold leading-6 text-zinc-700">{block.content}</p>
                    {block.url && (
                      <a href={block.url} target="_blank" rel="noreferrer noopener" className="focus-ring mt-3 inline-flex rounded-full bg-lime-mute px-4 py-2 text-sm font-black text-zinc-950">
                        Open link
                      </a>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}
          {!hasRsvpAccess && event.infoBlocks.length > 0 && (
            <LockedPreview title="room details unlock after RSVP" body="Extra notes, links, and venue details open once you join." />
          )}

          {poll && guestsCanVotePoll && <PublicDatePoll slug={event.slug} pollId={poll.id} question={poll.question} options={pollOptions} />}

          {hasRsvpAccess && shouldShowMemories && (
            <MemoriesTeaser
              slug={event.slug}
              memories={event.memoryPhotos}
              prominent={lifecycleStatus === "live" || lifecycleStatus === "ended"}
            />
          )}
          {!hasRsvpAccess && shouldShowMemories && (
            <LockedPreview title="photo album opens after RSVP" body="Guest photos stay tucked away until you join the room." />
          )}

          {hasRsvpAccess && hasMeaningfulActivity && (
            <section className="border-t border-zinc-950/10 pt-6">
              <h2 className="text-2xl font-black lowercase text-zinc-950">Activity</h2>
              <div className="mt-3 space-y-2">
                {event.activities.map((item) => (
                  <p key={item.id} className="text-sm font-bold leading-6 text-zinc-700">
                    {item.message}
                  </p>
                ))}
              </div>
            </section>
          )}
          {!hasRsvpAccess && hasMeaningfulActivity && (
            <LockedPreview title="activity unlocks after you join" body="RSVP first to see who is moving through the room." />
          )}
        </div>
      </section>

      <div className="fixed inset-x-3 bottom-3 z-40 rounded-full border border-zinc-950/10 bg-white/72 p-2 shadow-[0_20px_70px_rgba(77,23,52,0.18)] backdrop-blur lg:hidden">
        <div className="grid grid-cols-3 gap-2">
          {guestsCanRsvp ? (
            <>
              <a href="#rsvp-panel" className="rounded-full bg-ivory px-3 py-3 text-center text-sm font-black text-zinc-950">
                RSVP
              </a>
              <a href="#rsvp-panel" className="rounded-full border border-zinc-950/10 bg-white/58 px-3 py-3 text-center text-sm font-black text-zinc-950">
                Maybe
              </a>
            </>
          ) : hasRsvpAccess ? (
            <Link href={`/invite/${event.slug}/memories`} className="col-span-2 rounded-full bg-ivory px-3 py-3 text-center text-sm font-black text-zinc-950">
              Memories
            </Link>
          ) : (
            <a href="#rsvp-panel" className="col-span-2 rounded-full bg-ivory px-3 py-3 text-center text-sm font-black text-zinc-950">
              RSVP
            </a>
          )}
          <ShareWhatsAppButton href={whatsappUrl} label="Share" className="rounded-full border border-zinc-950/10 bg-white/58 px-3 py-3 text-center text-sm font-black text-zinc-950" />
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";
import { headers } from "next/headers";
import { AddToCalendar } from "@/components/calendar/add-to-calendar";
import { CopyLinkButton } from "@/components/copy-link-button";
import { AnimatedInviteCard } from "@/components/invite/animated-invite-card";
import { PublicGuestPreview } from "@/components/invite/public-guest-preview";
import { RsvpForm } from "@/components/invite/rsvp-form";
import { RsvpSummary } from "@/components/invite/rsvp-summary";
import { PublicDatePoll } from "@/components/polls/public-date-poll";
import { RealtimeRefresh } from "@/components/realtime/realtime-refresh";
import { ShareWhatsAppButton } from "@/components/share-whatsapp-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { isDatabaseConfigured } from "@/lib/auth/config";
import { createGoogleCalendarUrl } from "@/lib/calendar";
import { formatEventDate } from "@/lib/date";
import { demoEvent, recentActivity } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import { eventChannel, inviteChannel } from "@/lib/realtime/events";
import { createWhatsAppShareUrl } from "@/lib/whatsapp";

type InvitePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

function inviteTheme(theme: string) {
  const normalized = theme.toLowerCase();

  if (normalized.includes("after")) {
    return "afterdark";
  }

  if (normalized.includes("campus")) {
    return "campus";
  }

  if (normalized.includes("rooftop")) {
    return "neon";
  }

  if (normalized.includes("cafe")) {
    return "sunset";
  }

  return "mehfil";
}

function InviteNotFound() {
  return (
    <main className="dark-stage min-h-screen overflow-x-hidden px-4 py-6 text-foreground sm:px-6">
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

export default async function InvitePage({ params }: InvitePageProps) {
  if (!isDatabaseConfigured()) {
    return (
      <main className="dark-stage min-h-screen overflow-x-hidden px-4 py-6 text-foreground sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="theme-panel rounded-[2rem] border p-6 sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
              database setup needed
            </p>
            <h1 className="theme-heading mt-3 text-4xl font-black lowercase">
              connect Neon to open live invites
            </h1>
            <p className="theme-muted mt-4 font-semibold leading-7">
              Public demo invites still work, but live invite links need DATABASE_URL.
            </p>
            <Link href="/invite/demo" className="focus-ring theme-action mt-6 inline-flex rounded-full px-5 py-3 font-black">
              Open demo invite
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      host: true,
      rsvps: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          status: true,
          plusOne: true,
          createdAt: true,
        },
      },
      activities: {
        where: { type: { in: ["RSVP_CREATED", "RSVP_UPDATED"] } },
        orderBy: { createdAt: "desc" },
        take: 4,
      },
      datePolls: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          options: {
            orderBy: { optionDate: "asc" },
            include: { _count: { select: { votes: true } } },
          },
        },
      },
    },
  });

  if (!event) {
    return <InviteNotFound />;
  }

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") || "http";
  const origin = host ? `${protocol}://${host}` : "http://localhost:3000";
  const inviteUrl = `${origin}/invite/${event.slug}`;
  const whatsappUrl = createWhatsAppShareUrl(event.title, inviteUrl);
  const googleCalendarUrl = createGoogleCalendarUrl(event, inviteUrl);
  const icsUrl = `/api/events/${event.id}/calendar`;
  const dateLabel = formatEventDate(event.eventDate);
  const hostName = event.host.name || event.host.email?.split("@")[0] || "your host";
  const goingCount = event.rsvps.filter((rsvp) => rsvp.status === "GOING").length;
  const maybeCount = event.rsvps.filter((rsvp) => rsvp.status === "MAYBE").length;
  const notGoingCount = event.rsvps.filter((rsvp) => rsvp.status === "NOT_GOING").length;
  const goingFull = Boolean(event.capacity && goingCount >= event.capacity);
  const guestInitials = event.rsvps.length
    ? event.rsvps
        .filter((rsvp) => rsvp.status !== "NOT_GOING")
        .slice(0, 5)
        .map((rsvp) => rsvp.name.slice(0, 2).toUpperCase())
    : ["RI", "KA", "AN", "DV"];
  const poll = event.datePolls[0];
  const pollOptions =
    poll?.options.map((option) => ({
      id: option.id,
      optionDate: option.optionDate,
      label: option.label,
      votes: option._count.votes,
    })) || [];

  return (
    <main className="dark-stage min-h-screen overflow-x-hidden pb-28 text-foreground lg:pb-0">
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:px-8 lg:py-8">
        <div className="min-w-0 space-y-6">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="focus-ring inline-flex rounded-full bg-[color:var(--card)] px-4 py-2 text-sm font-black text-[color:var(--foreground)]">
              Sama
            </Link>
            <ThemeToggle />
          </div>

          <AnimatedInviteCard
            title={event.title}
            date={dateLabel}
            time={event.eventTime}
            host={hostName}
            location={event.location}
            description={event.description || "A Sama invite from your people, for your people."}
            guests={guestInitials}
            theme={inviteTheme(event.theme)}
          />

          <RealtimeRefresh
            channels={[inviteChannel(event.slug), eventChannel(event.id)]}
            enabled={Boolean(process.env.ABLY_API_KEY)}
            label="invite live"
          />

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["date", dateLabel],
              ["time", event.eventTime],
              ["place", event.location],
            ].map(([label, value]) => (
              <article key={label} className="theme-panel rounded-[1.5rem] border p-5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-lime-mute">{label}</p>
                <h2 className="theme-heading mt-2 text-xl font-black">{value}</h2>
              </article>
            ))}
          </div>

          <RsvpSummary
            going={goingCount}
            maybe={maybeCount}
            notGoing={notGoingCount}
            capacity={event.capacity}
          />

          <AddToCalendar googleUrl={googleCalendarUrl} icsUrl={icsUrl} />

          {poll && (
            <PublicDatePoll
              slug={event.slug}
              pollId={poll.id}
              question={poll.question}
              options={pollOptions}
            />
          )}

          <section className="theme-panel rounded-[2rem] border p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">
                  invite details
                </p>
                <h2 className="theme-heading mt-2 text-4xl font-black lowercase">
                  the room is warming up
                </h2>
              </div>
              <ShareWhatsAppButton href={whatsappUrl} />
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {[event.city, event.category, event.theme, event.visibility === "private" ? "private link" : "public"].filter(Boolean).map((item) => (
                <span key={item} className="rounded-full bg-black/42 px-4 py-2 text-sm font-black text-white">
                  {item}
                </span>
              ))}
            </div>
          </section>

          <PublicGuestPreview
            guests={event.rsvps
              .filter((rsvp) => rsvp.status !== "NOT_GOING")
              .slice(0, 12)
              .map((rsvp) => ({
                id: rsvp.id,
                name: rsvp.name,
                status: rsvp.status,
                plusOne: rsvp.plusOne,
              }))}
          />

          {(event.upiId || event.paymentNote) && (
            <section className="grid gap-4 md:grid-cols-2">
              <article className="rounded-[2rem] border border-white/10 bg-lime-mute p-6 text-zinc-950">
                <p className="text-sm font-black uppercase tracking-[0.16em]">UPI contribution</p>
                <h2 className="mt-3 text-2xl font-black">{event.paymentNote || "Contribution details added"}</h2>
                {event.upiId && <p className="mt-2 font-bold">UPI: {event.upiId}</p>}
              </article>
              <article className="theme-panel rounded-[2rem] border p-6">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-lime-mute">date poll</p>
                <p className="theme-muted mt-4 font-semibold leading-7">
                  Date polls connect in a later host flow. For now, this invite uses the saved date.
                </p>
              </article>
            </section>
          )}
        </div>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-5 lg:self-start">
          <RsvpForm slug={event.slug} goingFull={goingFull} />

          <section className="theme-panel rounded-[2rem] border p-5">
            <p className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-rose-neon">share</p>
            <div className="flex flex-col gap-2">
              <CopyLinkButton value={inviteUrl} />
              <ShareWhatsAppButton href={whatsappUrl} />
            </div>
          </section>

          <section className="theme-panel rounded-[2rem] border p-5">
            <p className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-rose-neon">activity</p>
            <div className="space-y-3">
              {event.activities.length
                ? event.activities.map((item) => (
                    <p key={item.id} className="rounded-2xl bg-black/35 px-4 py-3 text-sm font-bold text-zinc-300">
                      {item.message}
                    </p>
                  ))
                : recentActivity.slice(0, 3).map((item) => (
                    <p key={item} className="rounded-2xl bg-black/35 px-4 py-3 text-sm font-bold text-zinc-300">
                      {item}
                    </p>
                  ))}
            </div>
          </section>

          <Link href="/invite/demo/memories" className="focus-ring theme-panel block rounded-[2rem] border p-5">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">memories teaser</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {demoEvent.guests.slice(0, 6).map((guest) => (
                <span key={guest.name} className="aspect-square rounded-xl bg-gradient-to-br from-rose-neon to-lime-mute" />
              ))}
            </div>
          </Link>
        </aside>
      </section>

      <div className="fixed inset-x-3 bottom-3 z-40 rounded-full border border-white/10 bg-zinc-950/92 p-2 shadow-[0_20px_70px_rgba(0,0,0,0.55)] backdrop-blur lg:hidden">
        <div className="grid grid-cols-3 gap-2">
          <a href="#rsvp-form" className="rounded-full bg-ivory px-3 py-3 text-center text-sm font-black text-zinc-950">
            RSVP
          </a>
          <a href="#rsvp-form" className="rounded-full bg-white/8 px-3 py-3 text-center text-sm font-black text-white">
            Maybe
          </a>
          <ShareWhatsAppButton
            href={whatsappUrl}
            label="Share"
            className="rounded-full bg-white/8 px-3 py-3 text-center text-sm font-black text-white"
          />
        </div>
      </div>
    </main>
  );
}

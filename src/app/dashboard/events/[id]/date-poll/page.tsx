import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { deleteDatePollAction } from "@/app/dashboard/events/[id]/date-poll/actions";
import { DatePollForm } from "@/components/polls/date-poll-form";
import { PollResults } from "@/components/polls/poll-results";
import { RealtimeRefresh } from "@/components/realtime/realtime-refresh";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { isClerkConfigured, isDatabaseConfigured } from "@/lib/auth/config";
import { formatEventDate } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { eventChannel } from "@/lib/realtime/events";

type DatePollPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export const dynamic = "force-dynamic";

function SetupMessage({
  label,
  title,
  body,
}: {
  label: string;
  title: string;
  body: string;
}) {
  return (
    <main className="app-surface min-h-screen overflow-x-hidden px-4 py-6 text-foreground sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="theme-panel rounded-[2rem] border p-6 sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">
            {label}
          </p>
          <h1 className="theme-heading mt-3 text-4xl font-black lowercase">{title}</h1>
          <p className="theme-muted mt-4 font-semibold leading-7">{body}</p>
          <Link href="/dashboard" className="focus-ring theme-action mt-6 inline-flex rounded-full px-5 py-3 font-black">
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

export default async function DatePollPage({ params, searchParams }: DatePollPageProps) {
  if (!isClerkConfigured()) {
    return (
      <SetupMessage
        label="Clerk setup needed"
        title="connect auth to plan dates"
        body="Add Clerk keys before opening host planning tools."
      />
    );
  }

  await auth.protect();

  if (!isDatabaseConfigured()) {
    return (
      <SetupMessage
        label="database setup needed"
        title="connect Neon to save polls"
        body="Add DATABASE_URL, then run Prisma setup."
      />
    );
  }

  const { id } = await params;
  const { error } = await searchParams;
  const currentUser = await getCurrentUser();

  if (currentUser.status !== "ready" || !currentUser.dbUser) {
    return (
      <SetupMessage
        label="host profile unavailable"
        title="sync your host profile"
        body="Sama could not prepare your local host record."
      />
    );
  }

  const event = await prisma.event.findFirst({
    where: { id, hostId: currentUser.dbUser.id },
    include: {
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
    notFound();
  }

  const poll = event.datePolls[0];
  const options =
    poll?.options.map((option) => ({
      id: option.id,
      optionDate: option.optionDate,
      label: option.label,
      votes: option._count.votes,
    })) || [];
  const topOption = options.reduce<(typeof options)[number] | null>(
    (leader, option) => (!leader || option.votes > leader.votes ? option : leader),
    null,
  );

  return (
    <main className="app-surface min-h-screen overflow-x-hidden text-foreground">
      <header className="border-b border-[color:var(--border)] bg-white/72 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-2xl font-black lowercase text-[color:var(--foreground)]">
            Sama
          </Link>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/events/${event.id}`} className="text-sm font-black text-lime-mute">
              Manage
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_23rem] lg:px-8">
        <div className="min-w-0 space-y-6">
          <section className="film-grain relative overflow-hidden rounded-[2.4rem] bg-[radial-gradient(circle_at_22%_14%,rgba(255,46,139,0.38),transparent_28%),linear-gradient(135deg,#111,#281326,#050505)] p-7 shadow-[0_24px_90px_rgba(0,0,0,0.48)] sm:p-10">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
              plan the night
            </p>
            <h1 className="mt-3 max-w-4xl text-5xl font-black lowercase leading-none text-zinc-950 sm:text-7xl">
              date poll for {event.title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg font-semibold leading-8 text-zinc-700">
              {formatEventDate(event.eventDate)} - {event.eventTime} - {event.location}
            </p>
            <div className="mt-5">
              <RealtimeRefresh
                channels={[eventChannel(event.id)]}
                enabled={Boolean(process.env.ABLY_API_KEY)}
                label="poll live"
                clerkUserId={currentUser.clerkUser?.id}
              />
            </div>
          </section>

          {error && (
            <p className="rounded-2xl border border-rose-neon/30 bg-rose-neon/10 px-4 py-3 text-sm font-black text-rose-neon">
              {error}
            </p>
          )}

          {poll ? (
            <section className="theme-panel rounded-[2rem] border p-5 sm:p-7">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
                active poll
              </p>
              <h2 className="theme-heading mt-3 text-4xl font-black lowercase">{poll.question}</h2>
              {topOption && topOption.votes > 0 && (
                <p className="mt-3 rounded-2xl bg-lime-mute px-4 py-3 font-black text-zinc-950">
                  leading: {topOption.label || formatEventDate(topOption.optionDate)}
                </p>
              )}
              <div className="mt-5">
                <PollResults options={options} />
              </div>
              <form action={deleteDatePollAction} className="mt-5">
                <input type="hidden" name="pollId" value={poll.id} />
                <button
                  type="submit"
                  className="focus-ring w-full rounded-2xl border border-rose-neon/35 bg-rose-neon/12 px-5 py-4 text-left font-black text-rose-neon transition hover:bg-rose-neon/18"
                >
                  Delete date poll
                </button>
              </form>
            </section>
          ) : (
            <DatePollForm eventId={event.id} />
          )}
        </div>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-6 lg:self-start">
          <section className="theme-panel rounded-[2rem] border p-5">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">
              social planning
            </p>
            <p className="theme-muted mt-3 font-semibold leading-7">
              Guests can vote on multiple options. If they add a phone number,
              their next vote updates the old one.
            </p>
          </section>
          <Link
            href={`/dashboard/events/${event.id}`}
            className="focus-ring theme-action block rounded-full px-5 py-3 text-center font-black"
          >
            Back to manage event
          </Link>
        </aside>
      </section>
    </main>
  );
}

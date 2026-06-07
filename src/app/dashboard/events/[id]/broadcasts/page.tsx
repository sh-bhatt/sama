import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import {
  createBroadcastAction,
  deleteBroadcastAction,
  toggleBroadcastPinnedAction,
} from "@/app/dashboard/events/[id]/broadcasts/actions";
import { BroadcastList } from "@/components/broadcasts/broadcast-list";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { isClerkConfigured, isDatabaseConfigured } from "@/lib/auth/config";
import { formatEventDate } from "@/lib/date";
import { prisma } from "@/lib/prisma";

type BroadcastsPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

const inputClass =
  "focus-ring mt-2 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3 font-bold text-[color:var(--foreground)] placeholder:text-[color:var(--muted)]";

export const dynamic = "force-dynamic";

function SetupMessage({ title, body }: { title: string; body: string }) {
  return (
    <main className="dark-stage min-h-screen overflow-x-hidden px-4 py-6 text-foreground sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="theme-panel rounded-[2rem] border p-6 sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">
            setup needed
          </p>
          <h1 className="theme-heading mt-3 text-4xl font-black lowercase">{title}</h1>
          <p className="theme-muted mt-4 font-semibold leading-7">{body}</p>
        </div>
      </div>
    </main>
  );
}

export default async function BroadcastsPage({ params, searchParams }: BroadcastsPageProps) {
  if (!isClerkConfigured()) {
    return <SetupMessage title="connect auth to post updates" body="Add Clerk keys before opening host tools." />;
  }

  await auth.protect();

  if (!isDatabaseConfigured()) {
    return <SetupMessage title="connect Neon to save updates" body="Add DATABASE_URL and run Prisma setup." />;
  }

  const { id } = await params;
  const { error } = await searchParams;
  const currentUser = await getCurrentUser();

  if (currentUser.status !== "ready" || !currentUser.dbUser) {
    return <SetupMessage title="sync your host profile" body="Sama could not prepare your host record." />;
  }

  const event = await prisma.event.findFirst({
    where: { id, hostId: currentUser.dbUser.id },
    select: {
      id: true,
      title: true,
      slug: true,
      eventDate: true,
      eventTime: true,
      location: true,
      broadcasts: {
        orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          title: true,
          message: true,
          audience: true,
          pinned: true,
          createdAt: true,
        },
      },
    },
  });

  if (!event) {
    notFound();
  }

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") || "http";
  const origin = host ? `${protocol}://${host}` : "http://localhost:3000";
  const inviteUrl = `${origin}/invite/${event.slug}`;

  return (
    <main className="dark-stage min-h-screen overflow-x-hidden text-foreground">
      <header className="border-b border-[color:var(--border)] bg-[color:var(--background)]/72 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-2xl font-black lowercase text-[color:var(--foreground)]">Sama</Link>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/events/${event.id}`} className="text-sm font-black text-lime-mute">Manage</Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:px-8">
        <div className="min-w-0 space-y-6">
          <section className="theme-panel rounded-[2rem] border p-6 sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
              host broadcasts
            </p>
            <h1 className="theme-heading mt-3 text-5xl font-black lowercase leading-none">
              updates for {event.title}
            </h1>
            <p className="theme-muted mt-4 font-semibold leading-7">
              {formatEventDate(event.eventDate)} - {event.eventTime} - {event.location}
            </p>
          </section>

          {error && (
            <p className="rounded-2xl border border-rose-neon/30 bg-rose-neon/10 px-4 py-3 text-sm font-black text-rose-neon">
              {error}
            </p>
          )}

          <BroadcastList
            broadcasts={event.broadcasts}
            eventTitle={event.title}
            inviteUrl={inviteUrl}
            renderActions={(broadcast) => (
              <>
                <form action={toggleBroadcastPinnedAction}>
                  <input type="hidden" name="broadcastId" value={broadcast.id} />
                  <button className="focus-ring rounded-full bg-[color:var(--card)] px-4 py-2 text-sm font-black text-[color:var(--foreground)]">
                    {broadcast.pinned ? "Unpin" : "Pin"}
                  </button>
                </form>
                <form action={deleteBroadcastAction}>
                  <input type="hidden" name="broadcastId" value={broadcast.id} />
                  <button className="focus-ring rounded-full border border-rose-neon/35 bg-rose-neon/12 px-4 py-2 text-sm font-black text-rose-neon">
                    Delete
                  </button>
                </form>
              </>
            )}
          />
        </div>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-6 lg:self-start">
          <form action={createBroadcastAction} className="theme-panel rounded-[2rem] border p-5 sm:p-6">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">
              post update
            </p>
            <input type="hidden" name="eventId" value={event.id} />
            <label className="mt-5 block">
              <span className="theme-muted text-sm font-black">Title</span>
              <input name="title" required maxLength={80} className={inputClass} placeholder="Entry starts at 8 PM" />
            </label>
            <label className="mt-4 block">
              <span className="theme-muted text-sm font-black">Message</span>
              <textarea name="message" required maxLength={500} rows={5} className={`${inputClass} resize-none`} placeholder="Gate opens at 8. Keep your college ID ready at entry." />
            </label>
            <label className="mt-4 block">
              <span className="theme-muted text-sm font-black">Audience</span>
              <select name="audience" defaultValue="ALL" className={inputClass}>
                <option value="ALL">All guests</option>
                <option value="GOING">Going</option>
                <option value="MAYBE">Maybe</option>
                <option value="APPROVED">Approved</option>
                <option value="PENDING">Pending</option>
                <option value="WAITLISTED">Waitlisted</option>
              </select>
            </label>
            <label className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3">
              <span>
                <span className="theme-heading block font-black">Pin update</span>
                <span className="theme-muted block text-sm font-semibold">Pinned updates appear first.</span>
              </span>
              <input name="pinned" type="checkbox" className="size-5 accent-lime-mute" />
            </label>
            <button className="focus-ring theme-action mt-5 w-full rounded-2xl px-5 py-4 font-black">
              Post update
            </button>
          </form>
          <section className="theme-panel rounded-[2rem] border p-5">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
              delivery note
            </p>
            <p className="theme-muted mt-3 text-sm font-semibold leading-6">
              Audience-specific delivery through email or WhatsApp will come later. For now, use the audience to decide who to manually send copied updates to.
            </p>
          </section>
        </aside>
      </section>
    </main>
  );
}

import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { CopyLinkButton } from "@/components/copy-link-button";
import { ShareWhatsAppButton } from "@/components/share-whatsapp-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { isClerkConfigured, isDatabaseConfigured } from "@/lib/auth/config";
import { formatDateTimeLabel } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { createWhatsAppShareUrl } from "@/lib/whatsapp";

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
    <main className="dark-stage min-h-screen overflow-x-hidden px-4 py-6 text-foreground sm:px-6">
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

export default async function DashboardInviteToolsPage() {
  if (!isClerkConfigured()) {
    return (
      <SetupMessage
        label="Clerk setup needed"
        title="connect auth to open invite tools"
        body="Add Clerk keys to your local environment before opening host tools."
      />
    );
  }

  await auth.protect();

  if (!isDatabaseConfigured()) {
    return (
      <SetupMessage
        label="database setup needed"
        title="connect Neon to load invite tools"
        body="Add DATABASE_URL, then run Prisma generate and db push."
      />
    );
  }

  const currentUser = await getCurrentUser();

  if (currentUser.status !== "ready" || !currentUser.dbUser) {
    return (
      <SetupMessage
        label="host profile unavailable"
        title="sync your host profile"
        body="Clerk is active, but Sama could not prepare your local organizer record."
      />
    );
  }

  const headerList = await headers();
  const origin =
    headerList.get("x-forwarded-host") || headerList.get("host")
      ? `${headerList.get("x-forwarded-proto") || "http"}://${headerList.get("x-forwarded-host") || headerList.get("host")}`
      : "http://localhost:3000";
  const events = await prisma.event.findMany({
    where: { hostId: currentUser.dbUser.id },
    orderBy: [{ eventDate: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      visibility: true,
      eventDate: true,
      eventTime: true,
      city: true,
      location: true,
      _count: {
        select: {
          rsvps: true,
          interests: true,
        },
      },
    },
  });

  return (
    <main className="dark-stage min-h-screen overflow-x-hidden text-foreground">
      <header className="border-b border-[color:var(--border)] bg-[color:var(--background)]/72 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="min-w-0 text-2xl font-black lowercase text-[color:var(--foreground)]">
            Sama
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/dashboard" className="text-sm font-black text-lime-mute">
              Dashboard
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <Link href="/dashboard" className="text-sm font-black text-lime-mute">
            Back to dashboard
          </Link>
          <h1 className="theme-heading mt-4 max-w-4xl text-6xl font-black lowercase leading-none">
            invite tools
          </h1>
          <p className="theme-muted mt-4 max-w-2xl text-lg font-semibold leading-8">
            All your room links in one place, ready for WhatsApp, stories, albums, and event management.
          </p>
        </div>

        {events.length ? (
          <div className="grid min-w-0 gap-4 lg:grid-cols-2">
            {events.map((event) => {
              const inviteUrl = `${origin}/invite/${event.slug}`;
              const whatsappUrl = createWhatsAppShareUrl(event.title, inviteUrl);

              return (
                <article key={event.id} className="theme-panel min-w-0 rounded-[2rem] border p-5 sm:p-6">
                  <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-lime-mute px-3 py-1 text-xs font-black text-zinc-950">
                          {event.visibility}
                        </span>
                        <span className="rounded-full bg-black/35 px-3 py-1 text-xs font-black text-white">
                          {event._count.rsvps} RSVPs
                        </span>
                        <span className="rounded-full bg-black/35 px-3 py-1 text-xs font-black text-rose-neon">
                          {event._count.interests} interested
                        </span>
                      </div>
                      <h2 className="theme-heading mt-4 text-3xl font-black lowercase leading-tight">
                        {event.title}
                      </h2>
                      <p className="theme-muted mt-2 text-sm font-semibold">
                        {formatDateTimeLabel(event.eventDate, event.eventTime)}
                      </p>
                      <p className="theme-muted mt-1 text-sm font-semibold">
                        {event.city ? `${event.city} - ` : ""}
                        {event.location}
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/events/${event.id}`}
                      className="focus-ring shrink-0 rounded-full bg-[color:var(--card)] px-4 py-2 text-sm font-black text-[color:var(--foreground)] transition hover:-translate-y-0.5"
                    >
                      Manage event
                    </Link>
                  </div>

                  <p className="theme-muted mt-5 break-all rounded-2xl bg-black/35 px-4 py-3 text-sm font-semibold">
                    {inviteUrl}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <CopyLinkButton value={inviteUrl} />
                    <ShareWhatsAppButton href={whatsappUrl} />
                    <Link
                      href={`/invite/${event.slug}`}
                      className="focus-ring rounded-full bg-[color:var(--card)] px-4 py-2 text-sm font-black text-[color:var(--foreground)] transition hover:-translate-y-0.5"
                    >
                      Open invite
                    </Link>
                    <Link
                      href={`/invite/${event.slug}/memories`}
                      className="focus-ring rounded-full bg-[color:var(--card)] px-4 py-2 text-sm font-black text-[color:var(--foreground)] transition hover:-translate-y-0.5"
                    >
                      Public album
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <section className="theme-panel rounded-[2rem] border p-6 sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
              empty toolkit
            </p>
            <h2 className="theme-heading mt-3 text-4xl font-black lowercase">
              no invite tools yet.
            </h2>
            <p className="theme-muted mt-3 max-w-2xl font-semibold leading-7">
              Create your first invite and Sama will collect its public link, sharing controls, and album shortcuts here.
            </p>
            <Link href="/dashboard/events/new" className="focus-ring theme-action mt-5 inline-flex rounded-full px-5 py-3 font-black">
              Create your first invite
            </Link>
          </section>
        )}
      </section>
    </main>
  );
}

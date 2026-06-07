import Link from "next/link";
import { OrganizerEventCard } from "@/components/profile/organizer-event-card";
import { OrganizerHero } from "@/components/profile/organizer-hero";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { isDatabaseConfigured } from "@/lib/auth/config";
import { normalizeUsername } from "@/lib/profile";
import { prisma } from "@/lib/prisma";

type OrganizerPageProps = {
  params: Promise<{ username: string }>;
};

export const dynamic = "force-dynamic";

function getToday() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function SetupState({
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
          <Link href="/discover" className="focus-ring theme-action mt-6 inline-flex rounded-full px-5 py-3 font-black">
            Back to Discover
          </Link>
        </div>
      </div>
    </main>
  );
}

export default async function OrganizerPage({ params }: OrganizerPageProps) {
  if (!isDatabaseConfigured()) {
    return (
      <SetupState
        label="database setup needed"
        title="connect Neon to open profiles"
        body="Public organizer profiles need the live database connection."
      />
    );
  }

  const { username } = await params;
  const normalizedUsername = normalizeUsername(username);

  if (!normalizedUsername) {
    return (
      <SetupState
        label="profile not found"
        title="this organizer page is not open"
        body="The username may have changed, or this organizer may not have a public profile."
      />
    );
  }

  const userResult = await prisma.user
    .findUnique({
      where: { username: normalizedUsername },
      select: {
        id: true,
        name: true,
        username: true,
        imageUrl: true,
        bio: true,
        location: true,
        instagramUrl: true,
        websiteUrl: true,
        publicProfile: true,
      },
    })
    .then((user) => ({ status: "ready" as const, user }))
    .catch((error) => {
      console.warn("Organizer profile load failed:", error);
      return { status: "database-error" as const, user: null };
    });

  if (userResult.status === "database-error") {
    return (
      <SetupState
        label="profile paused"
        title="the host page needs a refresh"
        body="Sama could not reach Neon just now. Try again in a moment."
      />
    );
  }

  const user = userResult.user;

  if (!user || !user.publicProfile) {
    return (
      <SetupState
        label="profile not found"
        title="this organizer page is private"
        body="The host may have turned off their public profile, but public events remain available in Discover."
      />
    );
  }

  const today = getToday();
  const [upcomingEvents, pastEvents, totalPublicEvents] = await Promise.all([
    prisma.event.findMany({
      where: {
        hostId: user.id,
        visibility: "public",
        eventDate: { gte: today },
      },
      orderBy: { eventDate: "asc" },
      take: 12,
      select: {
        id: true,
        title: true,
        slug: true,
        eventDate: true,
        eventTime: true,
        location: true,
        city: true,
        category: true,
        theme: true,
        coverImage: true,
        capacity: true,
        requiresApproval: true,
        waitlistEnabled: true,
        _count: { select: { interests: true, rsvps: true } },
      },
    }),
    prisma.event.findMany({
      where: {
        hostId: user.id,
        visibility: "public",
        eventDate: { lt: today },
      },
      orderBy: { eventDate: "desc" },
      take: 6,
      select: {
        id: true,
        title: true,
        slug: true,
        eventDate: true,
        eventTime: true,
        location: true,
        city: true,
        category: true,
        theme: true,
        coverImage: true,
        capacity: true,
        requiresApproval: true,
        waitlistEnabled: true,
        _count: { select: { interests: true, rsvps: true } },
      },
    }),
    prisma.event.count({
      where: { hostId: user.id, visibility: "public" },
    }),
  ]);

  return (
    <main className="dark-stage min-h-screen overflow-x-hidden text-foreground">
      <header className="border-b border-[color:var(--border)] bg-[color:var(--background)]/72 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-2xl font-black lowercase text-[color:var(--foreground)]">
            Sama
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/discover" className="text-sm font-black text-lime-mute">
              Discover
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <OrganizerHero
          user={user}
          totalEvents={totalPublicEvents}
          upcomingCount={upcomingEvents.length}
        />

        <section>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
                upcoming public events
              </p>
              <h2 className="theme-heading mt-2 text-5xl font-black lowercase">
                rooms they are hosting
              </h2>
            </div>
            <Link href="/discover" className="focus-ring theme-action inline-flex rounded-full px-5 py-3 text-sm font-black">
              Explore Discover
            </Link>
          </div>
          {upcomingEvents.length ? (
            <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {upcomingEvents.map((event) => (
                <OrganizerEventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="theme-panel rounded-[2rem] border p-6">
              <p className="theme-muted font-semibold leading-7">
                No upcoming public events from this organizer yet.
              </p>
            </div>
          )}
        </section>

        {pastEvents.length > 0 && (
          <section>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">
              past rooms
            </p>
            <div className="mt-5 grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {pastEvents.map((event) => (
                <OrganizerEventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

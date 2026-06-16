import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { EventDesignForm } from "@/components/events/event-design-form";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { isClerkConfigured, isDatabaseConfigured } from "@/lib/auth/config";
import { formatEventDateShort } from "@/lib/date";
import { getEventTheme } from "@/lib/event-themes";
import { getDisplayName } from "@/lib/profile";
import { prisma } from "@/lib/prisma";

type EventDesignPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
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

export default async function EventDesignPage({ params, searchParams }: EventDesignPageProps) {
  if (!isClerkConfigured()) {
    return (
      <SetupMessage
        label="Clerk setup needed"
        title="connect auth to edit card design"
        body="Add Clerk keys before opening host tools."
      />
    );
  }

  await auth.protect();

  if (!isDatabaseConfigured()) {
    return (
      <SetupMessage
        label="database setup needed"
        title="connect Neon to edit card design"
        body="Add DATABASE_URL, then run Prisma setup."
      />
    );
  }

  const [{ id }, { saved, error }] = await Promise.all([params, searchParams]);
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
    select: {
      id: true,
      title: true,
      description: true,
      eventDate: true,
      eventTime: true,
      location: true,
      theme: true,
      coverImage: true,
      cardDesign: true,
      host: {
        select: {
          name: true,
          username: true,
        },
      },
    },
  });

  if (!event) {
    notFound();
  }

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
            <Link href="/dashboard" className="text-sm font-black text-lime-mute">
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href={`/dashboard/events/${event.id}`} className="text-sm font-black text-lime-mute">
          Back to event
        </Link>
        <h1 className="theme-heading mt-4 max-w-3xl text-6xl font-black lowercase leading-none">
          Card Studio
        </h1>
        <p className="theme-muted mt-4 max-w-2xl text-lg font-semibold leading-8">
          Customize the poster style guests see across Sama.
        </p>

        <EventDesignForm
          event={{
            id: event.id,
            title: event.title,
            description: event.description,
            dateLabel: formatEventDateShort(event.eventDate),
            eventTime: event.eventTime,
            location: event.location,
            theme: getEventTheme(event.theme).inviteTheme,
            coverImage: event.coverImage,
            cardDesign: event.cardDesign,
          }}
          hostName={getDisplayName(event.host)}
          saved={saved === "1"}
          error={error}
        />
      </section>
    </main>
  );
}

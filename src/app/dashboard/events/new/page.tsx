import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { CreateEventForm } from "@/components/events/create-event-form";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { isClerkConfigured, isDatabaseConfigured } from "@/lib/auth/config";

type NewEventPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export const dynamic = "force-dynamic";

export default async function NewEventPage({ searchParams }: NewEventPageProps) {
  const { error } = await searchParams;

  if (!isClerkConfigured()) {
    return (
      <main className="dark-stage min-h-screen overflow-x-hidden px-4 py-6 text-foreground sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="theme-panel rounded-[2rem] border p-6 sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
              Clerk setup needed
            </p>
            <h1 className="theme-heading mt-3 text-4xl font-black lowercase">
              connect auth to create invites
            </h1>
            <p className="theme-muted mt-4 font-semibold leading-7">
              Add Clerk keys to your local environment before opening the event studio.
            </p>
            <Link href="/" className="focus-ring theme-action mt-6 inline-flex rounded-full px-5 py-3 font-black">
              Back to discovery
            </Link>
          </div>
        </div>
      </main>
    );
  }

  await auth.protect();

  if (!isDatabaseConfigured()) {
    return (
      <main className="dark-stage min-h-screen overflow-x-hidden px-4 py-6 text-foreground sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="theme-panel rounded-[2rem] border p-6 sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">
              database setup needed
            </p>
            <h1 className="theme-heading mt-3 text-4xl font-black lowercase">
              connect Neon to save invites
            </h1>
            <p className="theme-muted mt-4 font-semibold leading-7">
              Add DATABASE_URL, then run npx prisma generate and npx prisma db push.
            </p>
            <Link href="/dashboard" className="focus-ring theme-action mt-6 inline-flex rounded-full px-5 py-3 font-black">
              Back to dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const user = await currentUser();
  const hostName =
    user?.firstName ||
    user?.fullName ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "host the room";

  return (
    <main className="dark-stage min-h-screen text-foreground">
      <header className="border-b border-[color:var(--border)] bg-[color:var(--background)]/72 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-2xl font-black lowercase text-[color:var(--foreground)]">
            Sama
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/discover" className="text-sm font-black text-lime-mute">
              Discover
            </Link>
            <Link href="/dashboard" className="text-sm font-black text-lime-mute">
              Dashboard
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <Link href="/dashboard" className="text-sm font-black text-lime-mute">
            Back to dashboard
          </Link>
          <h1 className="theme-heading mt-4 max-w-3xl text-6xl font-black lowercase leading-none">
            start with the vibe
          </h1>
          <p className="theme-muted mt-4 max-w-2xl text-lg font-semibold leading-8">
            Build a poster first. Add date, place, RSVP, and the small things that make people show up.
          </p>

          {error && (
            <div className="mt-6 rounded-2xl border border-rose-neon/30 bg-rose-neon/10 px-4 py-3 text-sm font-black text-rose-neon">
              {error}
            </div>
          )}
        </div>

        <CreateEventForm hostName={hostName} />
      </section>
    </main>
  );
}

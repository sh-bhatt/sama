import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ProfileCard } from "@/components/profile/profile-card";
import { ProfileForm } from "@/components/profile/profile-form";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { isClerkConfigured, isDatabaseConfigured } from "@/lib/auth/config";

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

export default async function DashboardProfilePage() {
  if (!isClerkConfigured()) {
    return (
      <SetupMessage
        label="Clerk setup needed"
        title="connect auth to edit profiles"
        body="Add Clerk keys to your local environment before opening organizer settings."
      />
    );
  }

  await auth.protect();

  if (!isDatabaseConfigured()) {
    return (
      <SetupMessage
        label="database setup needed"
        title="connect Neon to save profiles"
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

  const user = currentUser.dbUser;

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
            <Link href="/dashboard" className="text-sm font-black text-lime-mute">
              Dashboard
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:px-8">
        <div className="min-w-0">
          <Link href="/dashboard" className="text-sm font-black text-lime-mute">
            Back to dashboard
          </Link>
          <h1 className="theme-heading mt-4 max-w-3xl text-6xl font-black lowercase leading-none">
            organizer profile
          </h1>
          <p className="theme-muted mt-4 max-w-2xl text-lg font-semibold leading-8">
            Help guests understand who is hosting before they RSVP. Keep it short, public, and true to your room.
          </p>
          <div className="mt-8">
            <ProfileForm user={user} />
          </div>
        </div>
        <aside className="min-w-0 lg:sticky lg:top-8 lg:self-start">
          <ProfileCard user={user} />
        </aside>
      </section>
    </main>
  );
}

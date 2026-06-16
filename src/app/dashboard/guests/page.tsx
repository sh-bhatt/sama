import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { GlobalGuestList } from "@/components/dashboard/global-guest-list";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { isClerkConfigured, isDatabaseConfigured } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

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

export default async function DashboardGuestsPage() {
  if (!isClerkConfigured()) {
    return (
      <SetupMessage
        label="Clerk setup needed"
        title="connect auth to open guest lists"
        body="Add Clerk keys to your local environment before opening host tools."
      />
    );
  }

  await auth.protect();

  if (!isDatabaseConfigured()) {
    return (
      <SetupMessage
        label="database setup needed"
        title="connect Neon to load guests"
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

  const guests = await prisma.rSVP.findMany({
    where: {
      event: {
        hostId: currentUser.dbUser.id,
      },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      approvalStatus: true,
      paymentStatus: true,
      checkedIn: true,
      plusOne: true,
      note: true,
      createdAt: true,
      event: {
        select: {
          id: true,
          title: true,
          slug: true,
          eventDate: true,
          eventTime: true,
        },
      },
      answers: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          answer: true,
          question: {
            select: {
              id: true,
              question: true,
            },
          },
        },
      },
    },
  });
  const approvalOrder = {
    PENDING: 0,
    WAITLISTED: 1,
    APPROVED: 2,
    REJECTED: 3,
  };
  const sortedGuests = [...guests].sort((a, b) => {
    const approvalDiff = approvalOrder[a.approvalStatus] - approvalOrder[b.approvalStatus];

    if (approvalDiff !== 0) {
      return approvalDiff;
    }

    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return (
    <main className="app-surface min-h-screen overflow-x-hidden text-foreground">
      <header className="border-b border-[color:var(--border)] bg-white/72 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="min-w-0 text-2xl font-black lowercase text-[color:var(--foreground)]">
            Sama
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/dashboard" className="text-sm font-black text-lime-mute">
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <Link href="/dashboard" className="text-sm font-black text-lime-mute">
            Back to dashboard
          </Link>
          <h1 className="theme-heading mt-4 max-w-4xl text-6xl font-black lowercase leading-none">
            guest list
          </h1>
          <p className="theme-muted mt-4 max-w-2xl text-lg font-semibold leading-8">
            Every guest across your rooms. Search, filter, and jump into the right event when a RSVP needs host action.
          </p>
        </div>

        <GlobalGuestList guests={sortedGuests} />
      </section>
    </main>
  );
}

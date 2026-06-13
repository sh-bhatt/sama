import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { MemoryGallery } from "@/components/memories/memory-gallery";
import { MemoryUploadForm } from "@/components/memories/memory-upload-form";
import { RealtimeRefresh } from "@/components/realtime/realtime-refresh";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { isClerkConfigured, isDatabaseConfigured } from "@/lib/auth/config";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { formatEventDate } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { eventChannel, inviteChannel } from "@/lib/realtime/events";

type MemoriesPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

function SetupMessage() {
  return (
    <main className="dark-stage min-h-screen overflow-x-hidden px-4 py-6 text-foreground sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="theme-panel rounded-[2rem] border p-6 sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">
            database setup needed
          </p>
          <h1 className="theme-heading mt-3 text-4xl font-black lowercase">
            connect Neon to open memories
          </h1>
          <p className="theme-muted mt-4 font-semibold leading-7">
            Add DATABASE_URL before opening real event albums.
          </p>
          <Link href="/" className="focus-ring theme-action mt-6 inline-flex rounded-full px-5 py-3 font-black">
            Back to discovery
          </Link>
        </div>
      </div>
    </main>
  );
}

export default async function MemoriesPage({ params }: MemoriesPageProps) {
  if (!isDatabaseConfigured()) {
    return <SetupMessage />;
  }

  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      memoryPhotos: {
        where: { approved: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!event) {
    notFound();
  }

  const viewerUserId = isClerkConfigured() ? (await auth()).userId : null;

  return (
    <main className="dark-stage min-h-screen overflow-x-hidden text-foreground">
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/invite/${event.slug}`}
            className="focus-ring inline-flex rounded-full bg-[color:var(--card)] px-4 py-2 text-sm font-black text-[color:var(--foreground)]"
          >
            Back to invite
          </Link>
          <div className="flex items-center gap-2">
            <RealtimeRefresh
              channels={[inviteChannel(event.slug), eventChannel(event.id)]}
              enabled={Boolean(process.env.ABLY_API_KEY)}
              label="album live"
              userId={viewerUserId}
            />
            <ThemeToggle />
          </div>
        </div>

        <div className="mt-8 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="min-w-0 space-y-6">
            <section className="film-grain relative overflow-hidden rounded-[2.4rem] bg-[radial-gradient(circle_at_20%_12%,rgba(255,46,139,0.34),transparent_28%),radial-gradient(circle_at_82%_70%,rgba(198,255,69,0.16),transparent_28%),linear-gradient(135deg,#111,#281326,#050505)] p-7 shadow-[0_24px_90px_rgba(0,0,0,0.48)] sm:p-10">
              <div className="relative">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
                  photo dump
                </p>
                <h1 className="mt-3 max-w-4xl text-5xl font-black lowercase leading-none text-white sm:text-7xl">
                  memories from {event.title}
                </h1>
                <p className="mt-4 max-w-2xl text-lg font-semibold leading-8 text-zinc-300">
                  {formatEventDate(event.eventDate)} - {event.location}. Guest photos, tiny captions,
                  and the room after the invite.
                </p>
              </div>
            </section>

            <MemoryGallery
              memories={event.memoryPhotos}
              eventTitle={event.title}
              emptyTitle="photo dump opens here"
              emptyBody="Add the first memory once the night starts moving."
            />
          </div>

          <aside className="min-w-0 space-y-4 lg:sticky lg:top-6 lg:self-start">
            <MemoryUploadForm
              slug={event.slug}
              cloudinaryReady={isCloudinaryConfigured()}
            />
            <section className="theme-panel rounded-[2rem] border p-5">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
                album rules
              </p>
              <div className="theme-muted mt-3 space-y-2 text-sm font-semibold leading-6">
                <p>Only upload photos you are happy for the room to see.</p>
                <p>Hosts can remove memories from their event console.</p>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

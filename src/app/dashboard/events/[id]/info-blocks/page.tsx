import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import {
  createInfoBlockAction,
  deleteInfoBlockAction,
} from "@/app/dashboard/events/[id]/info-blocks/actions";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { isClerkConfigured, isDatabaseConfigured } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

type InfoBlocksPageProps = {
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

export default async function InfoBlocksPage({ params, searchParams }: InfoBlocksPageProps) {
  if (!isClerkConfigured()) {
    return <SetupMessage title="connect auth to edit event info" body="Add Clerk keys before opening host tools." />;
  }

  await auth.protect();

  if (!isDatabaseConfigured()) {
    return <SetupMessage title="connect Neon to save event info" body="Add DATABASE_URL and run Prisma setup." />;
  }

  const { id } = await params;
  const { error } = await searchParams;
  const currentUser = await getCurrentUser();

  if (currentUser.status !== "ready" || !currentUser.dbUser) {
    return <SetupMessage title="sync your host profile" body="Sama could not prepare your host record." />;
  }

  const event = await prisma.event.findFirst({
    where: { id, hostId: currentUser.dbUser.id },
    include: {
      infoBlocks: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
    },
  });

  if (!event) {
    notFound();
  }

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
              event info
            </p>
            <h1 className="theme-heading mt-3 text-5xl font-black lowercase leading-none">
              details for {event.title}
            </h1>
            <p className="theme-muted mt-4 font-semibold leading-7">
              Add dress code, parking, links, FAQs, and the little instructions guests ask for.
            </p>
          </section>

          {error && (
            <p className="rounded-2xl border border-rose-neon/30 bg-rose-neon/10 px-4 py-3 text-sm font-black text-rose-neon">
              {error}
            </p>
          )}

          <section className="grid gap-4">
            {event.infoBlocks.length ? (
              event.infoBlocks.map((block) => (
                <article key={block.id} className="theme-panel rounded-[1.6rem] border p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-lime-mute">
                        {block.type.toLowerCase()}
                      </p>
                      <h2 className="theme-heading mt-2 text-2xl font-black">{block.title}</h2>
                      <p className="theme-muted mt-2 font-semibold leading-7">{block.content}</p>
                      {block.url && (
                        <a href={block.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-black text-rose-neon">
                          Open link
                        </a>
                      )}
                    </div>
                    <form action={deleteInfoBlockAction}>
                      <input type="hidden" name="blockId" value={block.id} />
                      <button className="focus-ring rounded-full border border-rose-neon/35 bg-rose-neon/12 px-4 py-2 text-sm font-black text-rose-neon">
                        Delete
                      </button>
                    </form>
                  </div>
                </article>
              ))
            ) : (
              <section className="theme-panel rounded-[2rem] border p-6">
                <h2 className="theme-heading text-3xl font-black lowercase">no info blocks yet</h2>
                <p className="theme-muted mt-3 font-semibold leading-7">
                  Start with the one question guests always ask.
                </p>
              </section>
            )}
          </section>
        </div>

        <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
          <form action={createInfoBlockAction} className="theme-panel rounded-[2rem] border p-5 sm:p-6">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">
              add block
            </p>
            <input type="hidden" name="eventId" value={event.id} />
            <label className="mt-5 block">
              <span className="theme-muted text-sm font-black">Type</span>
              <select name="type" defaultValue="TEXT" className={inputClass}>
                <option value="TEXT">Text</option>
                <option value="LINK">Link</option>
                <option value="FAQ">FAQ</option>
                <option value="NOTE">Note</option>
              </select>
            </label>
            <label className="mt-4 block">
              <span className="theme-muted text-sm font-black">Title</span>
              <input name="title" required maxLength={80} className={inputClass} placeholder="Dress code" />
            </label>
            <label className="mt-4 block">
              <span className="theme-muted text-sm font-black">Content</span>
              <textarea name="content" required maxLength={500} rows={4} className={`${inputClass} resize-none`} placeholder="Festive black, silver, or anything you can dance in." />
            </label>
            <label className="mt-4 block">
              <span className="theme-muted text-sm font-black">URL optional</span>
              <input name="url" type="url" className={inputClass} placeholder="https://..." />
            </label>
            <button className="focus-ring theme-action mt-5 w-full rounded-2xl px-5 py-4 font-black">
              Add info block
            </button>
          </form>
        </aside>
      </section>
    </main>
  );
}

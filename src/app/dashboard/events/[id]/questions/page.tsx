import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import {
  createRsvpQuestionAction,
  deleteRsvpQuestionAction,
} from "@/app/dashboard/events/[id]/questions/actions";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { isClerkConfigured, isDatabaseConfigured } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

type QuestionsPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

const inputClass =
  "focus-ring mt-2 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3 font-bold text-[color:var(--foreground)] placeholder:text-[color:var(--muted)]";

export const dynamic = "force-dynamic";

function SetupMessage({ title, body }: { title: string; body: string }) {
  return (
    <main className="app-surface min-h-screen overflow-x-hidden px-4 py-6 text-foreground sm:px-6">
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

export default async function QuestionsPage({ params, searchParams }: QuestionsPageProps) {
  if (!isClerkConfigured()) {
    return <SetupMessage title="connect auth to edit questions" body="Add Clerk keys before opening host tools." />;
  }

  await auth.protect();

  if (!isDatabaseConfigured()) {
    return <SetupMessage title="connect Neon to save questions" body="Add DATABASE_URL and run Prisma setup." />;
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
      rsvpQuestions: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
    },
  });

  if (!event) {
    notFound();
  }

  return (
    <main className="app-surface min-h-screen overflow-x-hidden text-foreground">
      <header className="border-b border-[color:var(--border)] bg-white/72 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-2xl font-black lowercase text-[color:var(--foreground)]">Sama</Link>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/events/${event.id}`} className="text-sm font-black text-lime-mute">Manage</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:px-8">
        <div className="min-w-0 space-y-6">
          <section className="theme-panel rounded-[2rem] border p-6 sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
              rsvp questions
            </p>
            <h1 className="theme-heading mt-3 text-5xl font-black lowercase leading-none">
              custom form for {event.title}
            </h1>
            <p className="theme-muted mt-4 font-semibold leading-7">
              Ask for song requests, allergies, college year, food preference, and the tiny details.
            </p>
          </section>

          {error && (
            <p className="rounded-2xl border border-rose-neon/30 bg-rose-neon/10 px-4 py-3 text-sm font-black text-rose-neon">
              {error}
            </p>
          )}

          <section className="grid gap-4">
            {event.rsvpQuestions.length ? (
              event.rsvpQuestions.map((question) => (
                <article key={question.id} className="theme-panel rounded-[1.6rem] border p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-zinc-950/10 bg-white/58 px-3 py-1 text-xs font-black text-lime-mute">
                          {question.type.toLowerCase().replace("_", " ")}
                        </span>
                        {question.required && (
                          <span className="rounded-full bg-saffron-200 px-3 py-1 text-xs font-black text-zinc-950">
                            required
                          </span>
                        )}
                      </div>
                      <h2 className="theme-heading mt-3 text-2xl font-black">{question.question}</h2>
                      {question.options.length > 0 && (
                        <p className="theme-muted mt-2 text-sm font-semibold">
                          Options: {question.options.join(", ")}
                        </p>
                      )}
                    </div>
                    <form action={deleteRsvpQuestionAction}>
                      <input type="hidden" name="questionId" value={question.id} />
                      <button className="focus-ring rounded-full border border-rose-neon/35 bg-rose-neon/12 px-4 py-2 text-sm font-black text-rose-neon">
                        Delete
                      </button>
                    </form>
                  </div>
                </article>
              ))
            ) : (
              <section className="theme-panel rounded-[2rem] border p-6">
                <h2 className="theme-heading text-3xl font-black lowercase">no questions yet</h2>
                <p className="theme-muted mt-3 font-semibold leading-7">
                  Add one required detail or a playful prompt.
                </p>
              </section>
            )}
          </section>
        </div>

        <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
          <form action={createRsvpQuestionAction} className="theme-panel rounded-[2rem] border p-5 sm:p-6">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">
              add question
            </p>
            <input type="hidden" name="eventId" value={event.id} />
            <label className="mt-5 block">
              <span className="theme-muted text-sm font-black">Type</span>
              <select name="type" defaultValue="SHORT_TEXT" className={inputClass}>
                <option value="TEXT">Text</option>
                <option value="SHORT_TEXT">Short text</option>
                <option value="LONG_TEXT">Long text</option>
                <option value="SINGLE_CHOICE">Single choice</option>
                <option value="MULTIPLE_CHOICE">Multiple choice</option>
              </select>
            </label>
            <label className="mt-4 block">
              <span className="theme-muted text-sm font-black">Question</span>
              <input name="question" required maxLength={160} className={inputClass} placeholder="Any song request?" />
            </label>
            <label className="mt-4 block">
              <span className="theme-muted text-sm font-black">Options for choice questions</span>
              <textarea name="options" rows={4} className={`${inputClass} resize-none`} placeholder={"Veg\nNon-veg\nNo preference"} />
            </label>
            <label className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3">
              <span>
                <span className="theme-heading block font-black">Required</span>
                <span className="theme-muted block text-sm font-semibold">Guests must answer before RSVP saves.</span>
              </span>
              <input name="required" type="checkbox" className="size-5 accent-lime-mute" />
            </label>
            <button className="focus-ring theme-action mt-5 w-full rounded-2xl px-5 py-4 font-black">
              Add question
            </button>
          </form>
        </aside>
      </section>
    </main>
  );
}

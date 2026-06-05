"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { submitPollVoteAction } from "@/app/invite/[slug]/actions";
import { formatEventDate } from "@/lib/date";
import {
  initialPollVoteActionState,
  type PollVoteActionState,
} from "@/lib/validations/date-poll";
import { PollResults } from "@/components/polls/poll-results";

type PollOption = {
  id: string;
  optionDate: Date;
  label: string | null;
  votes: number;
};

type PublicDatePollProps = {
  slug: string;
  pollId: string;
  question: string;
  options: PollOption[];
};

export function PublicDatePoll({ slug, pollId, question, options }: PublicDatePollProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [state, formAction, pending] = useActionState<PollVoteActionState, FormData>(
    submitPollVoteAction,
    initialPollVoteActionState,
  );

  function toggleOption(optionId: string) {
    setSelected((current) =>
      current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId],
    );
  }

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status, state.message]);

  return (
    <section className="theme-panel rounded-[2rem] border p-5 sm:p-6">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
        date poll
      </p>
      <h2 className="theme-heading mt-2 text-4xl font-black lowercase">{question}</h2>
      <form action={formAction} className="mt-5 space-y-4">
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="pollId" value={pollId} />
        {selected.map((optionId) => (
          <input key={optionId} type="hidden" name="selectedOptionIds" value={optionId} />
        ))}

        <div className="grid gap-3 sm:grid-cols-2">
          {options.map((option) => {
            const active = selected.includes(option.id);

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleOption(option.id)}
                className={[
                  "focus-ring rounded-2xl border px-4 py-4 text-left transition hover:-translate-y-0.5",
                  active
                    ? "border-lime-mute bg-lime-mute text-zinc-950"
                    : "border-[color:var(--border)] bg-black/35 text-white",
                ].join(" ")}
              >
                <span className="block text-sm font-black">
                  {option.label || formatEventDate(option.optionDate)}
                </span>
                {option.label && (
                  <span className="mt-1 block text-xs font-bold opacity-75">
                    {formatEventDate(option.optionDate)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className="theme-muted text-sm font-black">Name</span>
            <input
              name="guestName"
              required
              minLength={2}
              placeholder="Your name"
              className="focus-ring mt-2 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3 font-bold text-[color:var(--foreground)] placeholder:text-[color:var(--muted)]"
            />
          </label>
          <label>
            <span className="theme-muted text-sm font-black">Phone optional</span>
            <input
              name="guestPhone"
              placeholder="+91, to update later"
              className="focus-ring mt-2 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3 font-bold text-[color:var(--foreground)] placeholder:text-[color:var(--muted)]"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={pending || selected.length === 0}
          className="focus-ring w-full rounded-2xl bg-lime-mute px-5 py-4 font-black text-zinc-950 disabled:opacity-60"
        >
          {pending ? "Saving vote" : "Vote on dates"}
        </button>

        {state.message && (
          <p
            aria-live="polite"
            className={[
              "rounded-2xl px-4 py-3 text-sm font-black",
              state.status === "success"
                ? "bg-lime-mute text-zinc-950"
                : "bg-rose-neon/15 text-rose-neon",
            ].join(" ")}
          >
            {state.message}
          </p>
        )}
      </form>

      <div className="mt-6">
        <PollResults options={options} />
      </div>
    </section>
  );
}

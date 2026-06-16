"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { submitRsvpAction } from "@/app/invite/[slug]/actions";
import { RsvpChoiceButtons, type RsvpChoiceStatus } from "@/components/events/rsvp-choice-buttons";
import {
  initialRsvpActionState,
  type RsvpActionState,
} from "@/lib/validations/rsvp";

type RsvpFormProps = {
  slug: string;
  goingFull: boolean;
  initialStatus?: RsvpChoiceStatus;
  onCancel?: () => void;
  questions?: {
    id: string;
    type: "TEXT" | "SHORT_TEXT" | "LONG_TEXT" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE";
    question: string;
    options: string[];
    required: boolean;
  }[];
};

export function RsvpForm({ slug, goingFull, initialStatus, onCancel, questions = [] }: RsvpFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<RsvpActionState, FormData>(
    submitRsvpAction,
    initialRsvpActionState,
  );
  const [selectedStatus, setSelectedStatus] = useState<RsvpChoiceStatus>(initialStatus || (goingFull ? "MAYBE" : "GOING"));

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status, state.message]);

  return (
    <section id="rsvp-form" className="event-glass rounded-[2rem] p-5 shadow-[0_22px_80px_rgba(31,11,27,0.18)]">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">rsvp</p>
      <h2 className="mt-2 text-3xl font-black lowercase text-zinc-950">are you in?</h2>
      {goingFull && (
        <p className="mt-3 rounded-2xl bg-white/52 px-4 py-3 text-sm font-bold text-zinc-700">
          Going is full for now. Maybe is still open.
        </p>
      )}

      <form action={formAction} className="mt-5 space-y-4">
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="status" value={selectedStatus} />

        <RsvpChoiceButtons
          selectedStatus={selectedStatus}
          goingDisabled={goingFull}
          onSelect={setSelectedStatus}
          size="compact"
        />

        <label className="block">
          <span className="text-sm font-black text-zinc-700">Name</span>
          <input
            name="name"
            required
            minLength={2}
            placeholder="Your name"
            className="focus-ring mt-2 w-full rounded-2xl border border-zinc-950/10 bg-white/58 px-4 py-3 font-bold text-zinc-950 placeholder:text-zinc-500"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-black text-zinc-700">Email</span>
            <input
              name="email"
              type="email"
              placeholder="you@email.com"
              className="focus-ring mt-2 w-full rounded-2xl border border-zinc-950/10 bg-white/58 px-4 py-3 font-bold text-zinc-950 placeholder:text-zinc-500"
            />
          </label>
          <label className="block">
            <span className="text-sm font-black text-zinc-700">Phone</span>
            <input
              name="phone"
              placeholder="+91"
              className="focus-ring mt-2 w-full rounded-2xl border border-zinc-950/10 bg-white/58 px-4 py-3 font-bold text-zinc-950 placeholder:text-zinc-500"
            />
          </label>
        </div>

        <label className="flex items-center justify-between gap-4 rounded-2xl bg-white/52 px-4 py-3">
          <span>
            <span className="block font-black text-zinc-950">Bring a plus one</span>
            <span className="block text-sm font-bold text-zinc-600">Tell the host with your RSVP.</span>
          </span>
          <input name="plusOne" type="checkbox" className="size-5 accent-lime-mute" />
        </label>

        <label className="block">
          <span className="text-sm font-black text-zinc-700">Note to host</span>
          <textarea
            name="note"
            rows={4}
            placeholder="Song requests, food notes, or just say hi."
            className="focus-ring mt-2 w-full resize-none rounded-2xl border border-zinc-950/10 bg-white/58 px-4 py-3 font-bold text-zinc-950 placeholder:text-zinc-500"
          />
        </label>

        {questions.length > 0 && (
          <div className="space-y-4 rounded-[1.5rem] border border-zinc-950/10 bg-white/42 p-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
                host questions
              </p>
              <p className="mt-1 text-sm font-bold text-zinc-600">
                These answers are private to the host.
              </p>
            </div>
            {questions.map((question) => (
              <fieldset key={question.id} className="space-y-2">
                <legend className="text-sm font-black text-zinc-700">
                  {question.question}
                  {question.required && <span className="text-rose-neon"> *</span>}
                </legend>
                {question.type === "LONG_TEXT" || question.type === "TEXT" ? (
                  <textarea
                    name={`answer:${question.id}`}
                    rows={3}
                    required={question.required}
                    maxLength={300}
                    className="focus-ring w-full resize-none rounded-2xl border border-zinc-950/10 bg-white/58 px-4 py-3 font-bold text-zinc-950 placeholder:text-zinc-500"
                    placeholder="Your answer"
                  />
                ) : question.type === "SINGLE_CHOICE" ? (
                  <div className="grid gap-2">
                    {question.options.map((option, index) => (
                      <label key={`${question.id}-${index}`} className="flex items-center gap-3 rounded-2xl bg-white/52 px-4 py-3">
                        <input
                          type="radio"
                          name={`answer:${question.id}`}
                          value={option}
                          required={question.required}
                          className="size-4 accent-lime-mute"
                        />
                        <span className="text-sm font-bold text-zinc-950">{option}</span>
                      </label>
                    ))}
                  </div>
                ) : question.type === "MULTIPLE_CHOICE" ? (
                  <div className="grid gap-2">
                    {question.options.map((option, index) => (
                      <label key={`${question.id}-${index}`} className="flex items-center gap-3 rounded-2xl bg-white/52 px-4 py-3">
                        <input
                          type="checkbox"
                          name={`answer:${question.id}`}
                          value={option}
                          className="size-4 accent-lime-mute"
                        />
                        <span className="text-sm font-bold text-zinc-950">{option}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <input
                    name={`answer:${question.id}`}
                    required={question.required}
                    maxLength={300}
                    className="focus-ring w-full rounded-2xl border border-zinc-950/10 bg-white/58 px-4 py-3 font-bold text-zinc-950 placeholder:text-zinc-500"
                    placeholder="Your answer"
                  />
                )}
              </fieldset>
            ))}
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <button
            type="submit"
            disabled={pending}
            className="focus-ring rounded-2xl bg-lime-mute px-5 py-4 font-black text-zinc-950 disabled:opacity-60"
          >
            {pending ? "Saving RSVP" : "Save RSVP"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="focus-ring rounded-2xl bg-white/60 px-5 py-4 font-black text-zinc-950"
            >
              Cancel
            </button>
          )}
        </div>

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
    </section>
  );
}

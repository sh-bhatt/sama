"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { submitRsvpAction } from "@/app/invite/[slug]/actions";
import {
  initialRsvpActionState,
  type RsvpActionState,
} from "@/lib/validations/rsvp";

type RsvpFormProps = {
  slug: string;
  goingFull: boolean;
};

const statusOptions = [
  { label: "Going", value: "GOING" },
  { label: "Maybe", value: "MAYBE" },
  { label: "Can't make it", value: "NOT_GOING" },
] as const;

export function RsvpForm({ slug, goingFull }: RsvpFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<RsvpActionState, FormData>(
    submitRsvpAction,
    initialRsvpActionState,
  );
  const [selectedStatus, setSelectedStatus] = useState<"GOING" | "MAYBE" | "NOT_GOING">(
    goingFull ? "MAYBE" : "GOING",
  );

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status, state.message]);

  return (
    <section id="rsvp-form" className="rounded-[2rem] border border-white/10 bg-zinc-950 p-5 shadow-[0_22px_80px_rgba(0,0,0,0.5)]">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">rsvp</p>
      <h2 className="mt-2 text-3xl font-black lowercase text-white">are you in?</h2>
      {goingFull && (
        <p className="mt-3 rounded-2xl bg-white/8 px-4 py-3 text-sm font-bold text-zinc-300">
          Going is full for now. Maybe is still open.
        </p>
      )}

      <form action={formAction} className="mt-5 space-y-4">
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="status" value={selectedStatus} />

        <div className="grid gap-2">
          {statusOptions.map((option) => {
            const disabled = goingFull && option.value === "GOING";
            const active = selectedStatus === option.value;

            return (
              <button
                key={option.value}
                type="button"
                disabled={disabled}
                onClick={() => setSelectedStatus(option.value)}
                className={[
                  "focus-ring rounded-2xl px-4 py-4 text-left font-black transition active:scale-[0.98]",
                  active
                    ? "bg-ivory text-zinc-950"
                    : "bg-white/8 text-white hover:bg-white/12",
                  disabled ? "cursor-not-allowed opacity-45" : "",
                ].join(" ")}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <label className="block">
          <span className="text-sm font-black text-zinc-300">Name</span>
          <input
            name="name"
            required
            minLength={2}
            placeholder="Your name"
            className="focus-ring mt-2 w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3 font-bold text-white placeholder:text-zinc-500"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-black text-zinc-300">Email</span>
            <input
              name="email"
              type="email"
              placeholder="you@email.com"
              className="focus-ring mt-2 w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3 font-bold text-white placeholder:text-zinc-500"
            />
          </label>
          <label className="block">
            <span className="text-sm font-black text-zinc-300">Phone</span>
            <input
              name="phone"
              placeholder="+91"
              className="focus-ring mt-2 w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3 font-bold text-white placeholder:text-zinc-500"
            />
          </label>
        </div>

        <label className="flex items-center justify-between gap-4 rounded-2xl bg-white/8 px-4 py-3">
          <span>
            <span className="block font-black text-white">Bring a plus one</span>
            <span className="block text-sm font-bold text-zinc-400">Tell the host with your RSVP.</span>
          </span>
          <input name="plusOne" type="checkbox" className="size-5 accent-lime-mute" />
        </label>

        <label className="block">
          <span className="text-sm font-black text-zinc-300">Note to host</span>
          <textarea
            name="note"
            rows={4}
            placeholder="Song requests, food notes, or just say hi."
            className="focus-ring mt-2 w-full resize-none rounded-2xl border border-white/10 bg-white/8 px-4 py-3 font-bold text-white placeholder:text-zinc-500"
          />
        </label>

        <button
          type="submit"
          disabled={pending}
          className="focus-ring w-full rounded-2xl bg-lime-mute px-5 py-4 font-black text-zinc-950 disabled:opacity-60"
        >
          {pending ? "Saving RSVP" : "Save RSVP"}
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
    </section>
  );
}

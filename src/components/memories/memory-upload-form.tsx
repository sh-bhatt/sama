"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  uploadMemoryAction,
} from "@/app/invite/[slug]/memories/actions";
import { initialMemoryUploadActionState } from "@/lib/validations/memory";

function UploadButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="focus-ring theme-action rounded-full px-5 py-3 font-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Uploading..." : "Add memory"}
    </button>
  );
}

export function MemoryUploadForm({
  slug,
  cloudinaryReady,
}: {
  slug: string;
  cloudinaryReady: boolean;
}) {
  const [state, formAction] = useActionState(
    uploadMemoryAction,
    initialMemoryUploadActionState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <section className="theme-panel rounded-[2rem] border p-5 sm:p-6">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">
        add to the album
      </p>
      <h2 className="theme-heading mt-2 text-3xl font-black lowercase">
        drop one good photo
      </h2>
      <p className="theme-muted mt-2 text-sm font-semibold leading-6">
        JPG, PNG, or WebP. Max 5MB. Captions stay short and public.
      </p>

      {!cloudinaryReady && (
        <p className="mt-4 rounded-2xl border border-rose-neon/25 bg-rose-neon/10 px-4 py-3 text-sm font-black text-rose-neon">
          Cloudinary env vars are missing, so uploads are paused. Existing photos still show.
        </p>
      )}

      <form ref={formRef} action={formAction} className="mt-5 space-y-4">
        <input type="hidden" name="slug" value={slug} />
        <input
          type="file"
          name="photo"
          accept="image/jpeg,image/png,image/webp"
          disabled={!cloudinaryReady}
          required
          className="focus-ring block w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3 text-sm font-bold text-[color:var(--foreground)] file:mr-4 file:rounded-full file:border-0 file:bg-lime-mute file:px-4 file:py-2 file:font-black file:text-zinc-950 disabled:opacity-60"
        />
        <input
          name="uploaderName"
          maxLength={60}
          placeholder="Your name"
          className="focus-ring w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3 font-bold text-[color:var(--foreground)] placeholder:text-[color:var(--muted)]"
        />
        <textarea
          name="caption"
          maxLength={160}
          rows={3}
          placeholder="Caption, inside joke, one-line memory"
          className="focus-ring w-full resize-none rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3 font-bold text-[color:var(--foreground)] placeholder:text-[color:var(--muted)]"
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <UploadButton />
          {state.message && (
            <p
              aria-live="polite"
              className={`text-sm font-black ${
                state.status === "success" ? "text-lime-mute" : "text-rose-neon"
              }`}
            >
              {state.message}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}

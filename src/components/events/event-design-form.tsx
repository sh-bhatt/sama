"use client";

import { useEffect, useMemo, useState } from "react";
import { updateEventDesignAction } from "@/app/dashboard/events/[id]/design/actions";
import { CardStudioControls } from "@/components/events/card-studio-controls";
import { AnimatedInviteCard } from "@/components/invite/animated-invite-card";
import { normalizeCardDesign, type CardDesign } from "@/lib/card-design";
import type { InviteThemeKey } from "@/lib/event-themes";

type EventDesignFormProps = {
  event: {
    id: string;
    title: string;
    description: string | null;
    dateLabel: string;
    eventTime: string;
    location: string;
    theme: InviteThemeKey;
    coverImage: string | null;
    cardDesign: unknown;
  };
  hostName: string;
  saved?: boolean;
  error?: string;
};

export function EventDesignForm({ event, hostName, saved = false, error }: EventDesignFormProps) {
  const [cardDesign, setCardDesign] = useState<CardDesign>(() => normalizeCardDesign(event.cardDesign));
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const action = updateEventDesignAction.bind(null, event.id);

  useEffect(
    () => () => {
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
      }
    },
    [coverPreview],
  );

  const coverImage = coverPreview || event.coverImage;
  const previewGuests = useMemo(() => ["GO", "RS", "VP"], []);

  function updateCover(file: File | null) {
    setCoverPreview((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }

      return file ? URL.createObjectURL(file) : null;
    });
  }

  return (
    <form action={action} className="mt-8 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_25rem]">
      <div className="min-w-0 space-y-5">
        {saved && (
          <div className="rounded-2xl border border-lime-mute/30 bg-lime-mute/10 px-4 py-3 text-sm font-black text-lime-mute">
            Design saved.
          </div>
        )}
        {error && (
          <div className="rounded-2xl border border-rose-neon/30 bg-rose-neon/10 px-4 py-3 text-sm font-black text-rose-neon">
            {error}
          </div>
        )}

        <section className="theme-panel rounded-[2rem] border p-5 sm:p-7">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
            cover photo
          </p>
          <h2 className="theme-heading mt-2 text-3xl font-black lowercase">
            replace the poster image
          </h2>
          <p className="theme-muted mt-2 text-sm font-semibold">
            Optional. Leave blank to keep the current cover or gradient fallback.
          </p>
          <input
            name="coverImage"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(inputEvent) => updateCover(inputEvent.target.files?.[0] ?? null)}
            className="focus-ring mt-5 w-full rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3 text-sm font-bold text-[color:var(--foreground)] file:mr-4 file:rounded-full file:border-0 file:bg-lime-mute file:px-4 file:py-2 file:text-sm file:font-black file:text-zinc-950"
          />
        </section>

        <CardStudioControls value={event.cardDesign} onChange={setCardDesign} />

        <button type="submit" className="focus-ring w-full rounded-2xl bg-lime-mute px-5 py-4 font-black text-zinc-950">
          Save design
        </button>
      </div>

      <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <AnimatedInviteCard
          title={event.title}
          date={event.dateLabel}
          time={event.eventTime}
          host={hostName}
          location={event.location}
          description={event.description || "A Sama invite from your people, for your people."}
          guests={previewGuests}
          theme={event.theme}
          coverImage={coverImage}
          cardDesign={cardDesign}
          compact
        />
      </aside>
    </form>
  );
}

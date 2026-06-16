"use client";

import { useEffect, useState } from "react";
import { RsvpChoiceButtons, type RsvpChoiceStatus } from "@/components/events/rsvp-choice-buttons";
import { RsvpForm } from "@/components/invite/rsvp-form";

type RsvpDrawerProps = {
  slug: string;
  goingFull: boolean;
  disabled?: boolean;
  closedLabel?: string;
  questions?: {
    id: string;
    type: "TEXT" | "SHORT_TEXT" | "LONG_TEXT" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE";
    question: string;
    options: string[];
    required: boolean;
  }[];
};

const statusLabels: Record<RsvpChoiceStatus, string> = {
  GOING: "Going",
  MAYBE: "Maybe",
  NOT_GOING: "Can't Go",
};

export function RsvpDrawer({
  slug,
  goingFull,
  disabled = false,
  closedLabel = "RSVPs are closed for this room.",
  questions = [],
}: RsvpDrawerProps) {
  const [selectedStatus, setSelectedStatus] = useState<RsvpChoiceStatus | undefined>(undefined);
  const [open, setOpen] = useState(false);

  function chooseStatus(status: RsvpChoiceStatus) {
    if (disabled || (goingFull && status === "GOING")) {
      return;
    }

    setSelectedStatus(status);
    setOpen(true);
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <section id="rsvp-panel" className="px-1">
      {disabled ? (
        <p className="text-center text-sm font-black text-zinc-700">{closedLabel}</p>
      ) : (
        <p className="mb-3 text-center text-xs font-black text-zinc-700">choose your reply</p>
      )}
      {!disabled && (
      <RsvpChoiceButtons
        selectedStatus={selectedStatus}
        disabled={disabled}
        goingDisabled={goingFull}
        onSelect={chooseStatus}
        size="hero"
      />
      )}

      {open && selectedStatus && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-rose-100/58 p-0 backdrop-blur-sm sm:place-items-center sm:p-6">
          <button
            type="button"
            aria-label="Close RSVP form"
            className="absolute inset-0 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="rsvp-drawer-title"
            className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-[2rem] bg-[#fff5e8] p-4 shadow-[0_28px_120px_rgba(31,11,27,0.32)] sm:max-w-2xl sm:rounded-[2rem]"
          >
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-neon">
                  {statusLabels[selectedStatus]}
                </p>
                <h2 id="rsvp-drawer-title" className="text-2xl font-black lowercase text-zinc-950">
                  finish your RSVP
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="focus-ring rounded-full bg-white/70 px-4 py-2 text-sm font-black text-zinc-950"
              >
                Close
              </button>
            </div>
            <RsvpForm
              key={selectedStatus}
              slug={slug}
              goingFull={goingFull}
              initialStatus={selectedStatus}
              onCancel={() => setOpen(false)}
              questions={questions}
            />
          </div>
        </div>
      )}
    </section>
  );
}

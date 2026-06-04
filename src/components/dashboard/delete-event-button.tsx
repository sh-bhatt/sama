"use client";

import { deleteEventAction } from "@/app/dashboard/events/[id]/actions";

type DeleteEventButtonProps = {
  eventId: string;
};

export function DeleteEventButton({ eventId }: DeleteEventButtonProps) {
  return (
    <form
      action={deleteEventAction}
      onSubmit={(event) => {
        if (!window.confirm("Delete this invite? This cannot be undone.")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="eventId" value={eventId} />
      <button
        type="submit"
        className="focus-ring w-full rounded-2xl border border-rose-neon/35 bg-rose-neon/12 px-5 py-4 text-left font-black text-rose-neon transition hover:bg-rose-neon/18"
      >
        Delete invite
      </button>
    </form>
  );
}

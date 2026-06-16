import { createDatePollAction } from "@/app/dashboard/events/[id]/date-poll/actions";

const inputClass =
  "focus-ring mt-2 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3 font-bold text-[color:var(--foreground)] placeholder:text-[color:var(--muted)]";

export function DatePollForm({ eventId }: { eventId: string }) {
  return (
    <form action={createDatePollAction} className="theme-panel rounded-[2rem] border p-5 sm:p-7">
      <input type="hidden" name="eventId" value={eventId} />
      <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
        date poll
      </p>
      <h2 className="theme-heading mt-3 text-4xl font-black lowercase">
        let the room pick the night
      </h2>
      <label className="mt-5 block">
        <span className="theme-muted text-sm font-black">Question</span>
        <input
          name="question"
          required
          minLength={3}
          defaultValue="Which night works best?"
          className={inputClass}
        />
      </label>

      <div className="mt-5 grid gap-4">
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <div key={index} className="grid gap-3 rounded-2xl border border-zinc-950/10 bg-white/52 p-4 sm:grid-cols-[1fr_1.2fr]">
            <label>
              <span className="theme-muted text-sm font-black">
                Option {index} date{index <= 2 ? " *" : ""}
              </span>
              <input
                name={`optionDate${index}`}
                type="date"
                required={index <= 2}
                className={inputClass}
              />
            </label>
            <label>
              <span className="theme-muted text-sm font-black">Label optional</span>
              <input
                name={`optionLabel${index}`}
                placeholder={index === 1 ? "Fri night after work" : "Rooftop-friendly"}
                className={inputClass}
              />
            </label>
          </div>
        ))}
      </div>

      <button type="submit" className="focus-ring mt-5 w-full rounded-2xl bg-lime-mute px-5 py-4 font-black text-zinc-950">
        Create date poll
      </button>
    </form>
  );
}

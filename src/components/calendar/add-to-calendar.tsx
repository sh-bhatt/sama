type AddToCalendarProps = {
  googleUrl: string;
  icsUrl: string;
};

export function AddToCalendar({ googleUrl, icsUrl }: AddToCalendarProps) {
  return (
    <section className="theme-panel rounded-[2rem] border p-5">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
        add to calendar
      </p>
      <div className="mt-4 grid gap-2">
        <a
          href={googleUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="focus-ring rounded-full bg-[color:var(--accent)] px-4 py-3 text-center text-sm font-black text-[color:var(--accent-contrast)] transition hover:-translate-y-0.5"
        >
          Google Calendar
        </a>
        <a
          href={icsUrl}
          className="focus-ring rounded-full bg-[color:var(--card)] px-4 py-3 text-center text-sm font-black text-[color:var(--foreground)] transition hover:-translate-y-0.5"
        >
          Download .ics
        </a>
      </div>
    </section>
  );
}

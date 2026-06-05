type RsvpSummaryProps = {
  going: number;
  maybe: number;
  notGoing: number;
  capacity?: number | null;
};

export function RsvpSummary({ going, maybe, notGoing, capacity }: RsvpSummaryProps) {
  const capacityLabel = capacity ? `${going}/${capacity} going` : `${going} going`;
  const progress = capacity ? Math.min((going / capacity) * 100, 100) : 0;

  return (
    <section className="theme-panel rounded-[2rem] border p-5 sm:p-6">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
        live rsvps
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          ["Going", going],
          ["Maybe", maybe],
          ["Can't go", notGoing],
        ].map(([label, value]) => (
          <article key={label} className="rounded-2xl bg-black/35 px-4 py-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[color:var(--muted)]">
              {label}
            </p>
            <p className="theme-heading mt-2 text-3xl font-black">{value}</p>
          </article>
        ))}
      </div>
      {capacity && (
        <div className="mt-5">
          <div className="flex justify-between text-sm font-black text-[color:var(--foreground)]">
            <span>capacity</span>
            <span>{capacityLabel}</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-black/35">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-neon to-lime-mute"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </section>
  );
}

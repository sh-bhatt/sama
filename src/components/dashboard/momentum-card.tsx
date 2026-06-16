type MomentumItem = {
  day: string;
  count: number;
};

type MomentumCardProps = {
  momentum: MomentumItem[];
};

const barColors = ["bg-lime-mute", "bg-rose-neon", "bg-electric", "bg-saffron-200"];

export function MomentumCard({ momentum }: MomentumCardProps) {
  const maxCount = Math.max(...momentum.map((item) => item.count), 0);
  const hasMomentum = maxCount > 0;

  return (
    <section className="theme-panel min-w-0 rounded-[2rem] border p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
            guest momentum
          </p>
          <h3 className="theme-heading mt-2 text-3xl font-black lowercase">the list is moving</h3>
        </div>
        <span className="shrink-0 rounded-full border border-zinc-950/10 bg-white/58 px-3 py-1.5 text-xs font-black text-zinc-700">
          7 days
        </span>
      </div>

      {hasMomentum ? (
        <div className="mt-6 flex h-44 items-end gap-2 sm:gap-3">
          {momentum.map((item, index) => (
            <div key={item.day} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="flex h-32 w-full items-end rounded-full border border-zinc-950/10 bg-white/58 p-1">
                <div
                  className={`w-full rounded-full ${barColors[index % barColors.length]} shadow-[0_0_24px_rgba(198,255,69,0.18)]`}
                  style={{ height: `${Math.max(12, (item.count / maxCount) * 100)}%` }}
                />
              </div>
              <span className="theme-muted text-xs font-black">{item.day}</span>
              <span className="text-xs font-black text-lime-mute">{item.count}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-[1.5rem] border border-zinc-950/10 bg-white/58 px-4 py-8">
          <h4 className="theme-heading text-2xl font-black lowercase">no RSVP movement yet</h4>
          <p className="theme-muted mt-2 text-sm font-semibold leading-6">
            Share your invite to start the signal.
          </p>
        </div>
      )}
    </section>
  );
}

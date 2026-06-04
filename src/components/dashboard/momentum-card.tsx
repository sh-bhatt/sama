const momentum = [
  { day: "Mon", value: 42, color: "bg-lime-mute" },
  { day: "Tue", value: 58, color: "bg-rose-neon" },
  { day: "Wed", value: 46, color: "bg-electric" },
  { day: "Thu", value: 64, color: "bg-lime-mute" },
  { day: "Fri", value: 78, color: "bg-rose-neon" },
  { day: "Sat", value: 92, color: "bg-saffron-200" },
  { day: "Sun", value: 54, color: "bg-electric" },
];

export function MomentumCard() {
  return (
    <section className="theme-panel min-w-0 rounded-[2rem] border p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
            guest momentum
          </p>
          <h3 className="theme-heading mt-2 text-3xl font-black lowercase">the list is moving</h3>
        </div>
        <span className="shrink-0 rounded-full bg-black/35 px-3 py-1.5 text-xs font-black text-zinc-300">
          7 days
        </span>
      </div>
      <div className="mt-6 flex h-44 items-end gap-2 sm:gap-3">
        {momentum.map((item) => (
          <div key={item.day} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="flex h-32 w-full items-end rounded-full bg-black/35 p-1">
              <div
                className={`w-full rounded-full ${item.color} shadow-[0_0_24px_rgba(198,255,69,0.18)]`}
                style={{ height: `${item.value}%` }}
              />
            </div>
            <span className="theme-muted text-xs font-black">{item.day}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

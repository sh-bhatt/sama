const rsvps = [
  "Riya joined Moonlit Mehfil",
  "Kabir is maybe for Campus Farewell",
  "Ananya is bringing +1",
  "Dev copied invite link",
];

export function RecentRsvps() {
  return (
    <section className="theme-panel min-w-0 rounded-[2rem] border p-5">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-electric">
        recent RSVPs
      </p>
      <div className="mt-5 space-y-3">
        {rsvps.map((item, index) => (
          <div key={item} className="flex items-center gap-3 rounded-2xl bg-black/35 px-4 py-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-rose-neon to-lime-mute text-xs font-black text-zinc-950">
              {index + 1}
            </span>
            <p className="text-sm font-bold text-zinc-300">{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const moves = [
  "Send reminder to Maybe guests",
  "Add venue note",
  "Confirm UPI contribution",
  "Open check-in 30 mins before event",
];

export function HostChecklist() {
  return (
    <section className="theme-panel min-w-0 rounded-[2rem] border p-5">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">
        next host moves
      </p>
      <div className="mt-5 space-y-3">
        {moves.map((move, index) => (
          <div
            key={move}
            className="flex items-center gap-3 rounded-2xl bg-black/35 px-4 py-3 text-sm font-black text-white"
          >
            <span
              className={[
                "grid size-7 shrink-0 place-items-center rounded-full border text-xs",
                index === 0
                  ? "border-lime-mute bg-lime-mute text-zinc-950"
                  : "border-white/15 text-zinc-500",
              ].join(" ")}
            >
              {index === 0 ? "on" : ""}
            </span>
            {move}
          </div>
        ))}
      </div>
    </section>
  );
}

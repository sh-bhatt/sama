import Link from "next/link";

export type HostMove = {
  label: string;
  href?: string;
  active?: boolean;
};

type HostChecklistProps = {
  moves: HostMove[];
};

export function HostChecklist({ moves }: HostChecklistProps) {
  return (
    <section className="theme-panel min-w-0 rounded-[2rem] border p-5">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">
        next host moves
      </p>
      <div className="mt-5 space-y-3">
        {moves.length ? (
          moves.map((move, index) => {
            const content = (
              <>
                <span
                  className={[
                    "grid size-7 shrink-0 place-items-center rounded-full border text-xs",
                    move.active || index === 0
                      ? "border-lime-mute bg-lime-mute text-zinc-950"
                      : "border-white/15 text-zinc-500",
                  ].join(" ")}
                >
                  {move.active || index === 0 ? "on" : ""}
                </span>
                {move.label}
              </>
            );

            return move.href ? (
              <Link
                key={`${move.label}-${index}`}
                href={move.href}
                className="focus-ring flex items-center gap-3 rounded-2xl bg-black/35 px-4 py-3 text-sm font-black text-white transition hover:bg-white/10"
              >
                {content}
              </Link>
            ) : (
              <div
                key={`${move.label}-${index}`}
                className="flex items-center gap-3 rounded-2xl bg-black/35 px-4 py-3 text-sm font-black text-white"
              >
                {content}
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl bg-black/35 px-4 py-5">
            <h3 className="theme-heading text-xl font-black lowercase">all caught up</h3>
            <p className="theme-muted mt-2 text-sm font-semibold leading-6">
              No urgent host moves right now.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

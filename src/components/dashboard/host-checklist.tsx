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
    <section className="min-w-0 border-t border-zinc-950/10 pt-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-neon">
        next host moves
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {moves.length ? (
          moves.map((move, index) => {
            const content = (
              <>
                <span
                  className={[
                    "grid size-6 shrink-0 place-items-center rounded-full border text-[0.62rem]",
                    move.active || index === 0
                      ? "border-lime-mute bg-lime-mute text-zinc-950"
                      : "border-zinc-950/15 text-zinc-500",
                  ].join(" ")}
                >
                  {move.active || index === 0 ? "go" : ""}
                </span>
                {move.label}
              </>
            );

            return move.href ? (
              <Link
                key={`${move.label}-${index}`}
                href={move.href}
                className="focus-ring flex items-center gap-3 rounded-2xl border border-zinc-950/10 bg-white/46 px-3 py-2.5 text-sm font-bold text-zinc-800 transition hover:bg-white/78"
              >
                {content}
              </Link>
            ) : (
              <div
                key={`${move.label}-${index}`}
                className="flex items-center gap-3 rounded-2xl border border-zinc-950/10 bg-white/46 px-3 py-2.5 text-sm font-bold text-zinc-800"
              >
                {content}
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-zinc-950/10 bg-white/46 px-4 py-4">
            <h3 className="theme-heading text-lg font-black lowercase">all caught up</h3>
            <p className="theme-muted mt-2 text-sm font-semibold leading-6">
              No urgent host moves right now.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

import { formatEventDateShort } from "@/lib/date";

type PublicBroadcast = {
  id: string;
  title: string;
  message: string;
  pinned: boolean;
  createdAt: Date;
};

export function PublicBroadcasts({ broadcasts }: { broadcasts: PublicBroadcast[] }) {
  if (!broadcasts.length) {
    return null;
  }

  return (
    <section className="theme-panel rounded-[2rem] border p-5 sm:p-6">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
        host updates
      </p>
      <div className="mt-5 grid gap-3">
        {broadcasts.map((broadcast) => (
          <article
            key={broadcast.id}
            className={[
              "rounded-[1.5rem] px-4 py-4",
              broadcast.pinned
                ? "bg-lime-mute text-zinc-950"
                : "bg-black/35 text-[color:var(--foreground)]",
            ].join(" ")}
          >
            <div className="flex flex-wrap items-center gap-2">
              {broadcast.pinned && (
                <span className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-black text-lime-mute">
                  pinned
                </span>
              )}
              <span className={broadcast.pinned ? "text-xs font-black text-zinc-800" : "theme-muted text-xs font-black"}>
                {formatEventDateShort(broadcast.createdAt)}
              </span>
            </div>
            <h2 className="mt-2 text-xl font-black">{broadcast.title}</h2>
            <p className={broadcast.pinned ? "mt-2 font-semibold text-zinc-900" : "theme-muted mt-2 font-semibold leading-7"}>
              {broadcast.message}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

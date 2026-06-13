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
    <section className="border-t border-zinc-950/10 pt-6 dark:border-white/10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black lowercase text-zinc-950 dark:text-white">Updates</h2>
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        {broadcasts.map((broadcast) => (
          <article
            key={broadcast.id}
            className={[
              "rounded-[1.3rem] px-4 py-4 backdrop-blur",
              broadcast.pinned
                ? "bg-lime-mute text-zinc-950"
                : "bg-white/30 text-zinc-950 dark:bg-white/[0.06] dark:text-white",
            ].join(" ")}
          >
            <div className="flex flex-wrap items-center gap-2">
              {broadcast.pinned && (
                <span className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-black text-lime-mute">
                  pinned
                </span>
              )}
              <span className={broadcast.pinned ? "text-xs font-black text-zinc-800" : "text-xs font-black text-zinc-600 dark:text-zinc-400"}>
                {formatEventDateShort(broadcast.createdAt)}
              </span>
            </div>
            <h2 className="mt-2 text-xl font-black">{broadcast.title}</h2>
            <p className={broadcast.pinned ? "mt-2 font-semibold text-zinc-900" : "mt-2 font-semibold leading-7 text-zinc-700 dark:text-zinc-300"}>
              {broadcast.message}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

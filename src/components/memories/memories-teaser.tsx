import Link from "next/link";
import Image from "next/image";

type TeaserMemory = {
  id: string;
  imageUrl: string;
  caption: string | null;
};

export function MemoriesTeaser({
  slug,
  memories,
  prominent = false,
}: {
  slug: string;
  memories: TeaserMemory[];
  prominent?: boolean;
}) {
  return (
    <section className="border-t border-zinc-950/10 pt-6 dark:border-white/10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className={prominent ? "text-4xl font-black lowercase text-zinc-950 dark:text-white" : "text-2xl font-black lowercase text-zinc-950 dark:text-white"}>
            Memories
          </h2>
        </div>
        <Link
          href={`/invite/${slug}/memories`}
          className="focus-ring inline-flex rounded-full bg-zinc-950 px-5 py-3 text-sm font-black text-white dark:bg-ivory dark:text-zinc-950"
        >
          {prominent ? "Open album" : "Photos"}
        </Link>
      </div>

      {memories.length ? (
        <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {memories.map((memory) => (
            <Image
              key={memory.id}
              src={memory.imageUrl}
              alt={memory.caption || "Sama memory"}
              width={240}
              height={240}
              sizes="(min-width: 640px) 96px, 33vw"
              className="aspect-square rounded-[1.1rem] object-cover shadow-[0_14px_35px_rgba(31,11,27,0.12)]"
            />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Photo dump opens here after the night.
        </p>
      )}
    </section>
  );
}

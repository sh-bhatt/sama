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
}: {
  slug: string;
  memories: TeaserMemory[];
}) {
  return (
    <section className="theme-panel rounded-[2rem] border p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
            memories
          </p>
          <h2 className="theme-heading mt-2 text-4xl font-black lowercase">
            photo dump
          </h2>
        </div>
        <Link
          href={`/invite/${slug}/memories`}
          className="focus-ring theme-action inline-flex rounded-full px-5 py-3 text-sm font-black"
        >
          Open album
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
              className="aspect-square rounded-2xl object-cover"
            />
          ))}
        </div>
      ) : (
        <p className="theme-muted mt-5 rounded-2xl bg-black/35 px-4 py-4 font-semibold">
          Photo dump opens here after the night.
        </p>
      )}
    </section>
  );
}

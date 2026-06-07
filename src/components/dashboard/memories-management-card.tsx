import Link from "next/link";
import Image from "next/image";
import { DeleteMemoryButton } from "@/components/dashboard/delete-memory-button";

type DashboardMemory = {
  id: string;
  imageUrl: string;
  caption: string | null;
  uploaderName?: string | null;
  uploadedBy?: string | null;
};

export function MemoriesManagementCard({
  slug,
  memories,
  totalCount = memories.length,
}: {
  slug: string;
  memories: DashboardMemory[];
  totalCount?: number;
}) {
  return (
    <section className="theme-panel rounded-[2rem] border p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
            memories
          </p>
          <h2 className="theme-heading mt-2 text-3xl font-black lowercase">
            {totalCount} photos in the room
          </h2>
        </div>
        <Link
          href={`/invite/${slug}/memories`}
          className="focus-ring theme-action inline-flex rounded-full px-5 py-3 text-sm font-black"
        >
          Public album
        </Link>
      </div>

      {memories.length ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {memories.slice(0, 6).map((memory) => (
            <article key={memory.id} className="relative overflow-hidden rounded-2xl bg-black/35">
              <Image
                src={memory.imageUrl}
                alt={memory.caption || "Event memory"}
                width={360}
                height={360}
                sizes="(min-width: 640px) 33vw, 100vw"
                className="aspect-square w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3">
                <p className="truncate text-xs font-black text-white">
                  {memory.caption || memory.uploaderName || memory.uploadedBy || "memory"}
                </p>
                <div className="mt-2">
                  <DeleteMemoryButton memoryId={memory.id} />
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="theme-muted mt-5 rounded-2xl bg-black/35 px-4 py-4 font-semibold">
          Guest photos will appear here as the album wakes up.
        </p>
      )}
    </section>
  );
}

import { MemoryCard } from "@/components/memories/memory-card";

type Memory = {
  id: string;
  imageUrl: string;
  caption: string | null;
  uploadedBy?: string | null;
  uploaderName?: string | null;
  createdAt?: Date;
};

type MemoryGalleryProps = {
  memories: Memory[];
  eventTitle: string;
  emptyTitle?: string;
  emptyBody?: string;
  renderActions?: (memory: Memory) => React.ReactNode;
};

export function MemoryGallery({
  memories,
  eventTitle,
  emptyTitle = "photo dump opens here",
  emptyBody = "The first memory will turn this room into a living album.",
  renderActions,
}: MemoryGalleryProps) {
  if (!memories.length) {
    return (
      <section className="film-grain relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(255,46,139,0.18),transparent_28%),radial-gradient(circle_at_78%_72%,rgba(198,255,69,0.14),transparent_28%)]" />
        <div className="relative mx-auto max-w-lg">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
            no photos yet
          </p>
          <h2 className="theme-heading mt-3 text-4xl font-black lowercase">{emptyTitle}</h2>
          <p className="theme-muted mt-3 font-semibold leading-7">{emptyBody}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-3 sm:p-4">
      <div className="liquid-gradient absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,46,139,0.18),transparent_24%),radial-gradient(circle_at_78%_70%,rgba(249,217,130,0.14),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))]" />
      <div className="relative z-10 grid auto-rows-[14rem] grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {memories.map((memory, index) => (
          <MemoryCard
            key={memory.id}
            memory={memory}
            eventTitle={eventTitle}
            large={index === 0 && memories.length > 3}
          >
            {renderActions?.(memory)}
          </MemoryCard>
        ))}
      </div>
    </section>
  );
}

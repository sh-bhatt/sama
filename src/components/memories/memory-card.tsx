import Image from "next/image";

type MemoryCardProps = {
  memory: {
    id: string;
    imageUrl: string;
    caption: string | null;
    uploadedBy?: string | null;
    uploaderName?: string | null;
    createdAt?: Date;
  };
  eventTitle: string;
  large?: boolean;
  children?: React.ReactNode;
};

export function MemoryCard({ memory, eventTitle, large = false, children }: MemoryCardProps) {
  const displayName = memory.uploaderName || memory.uploadedBy;

  return (
    <article
      className={`tilt-card film-grain group relative min-w-0 overflow-hidden rounded-[1.6rem] border border-zinc-950/10 bg-white/58 shadow-[0_24px_80px_rgba(77,23,52,0.16)] ${
        large ? "sm:col-span-2 sm:row-span-2" : ""
      }`}
    >
      <Image
        src={memory.imageUrl}
        alt={`${eventTitle} memory`}
        width={900}
        height={1125}
        sizes={large ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 33vw, 50vw"}
        className={`w-full object-cover transition duration-300 group-hover:scale-[1.03] ${
          large ? "h-full min-h-[22rem]" : "aspect-[4/5]"
        }`}
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/86 via-black/45 to-transparent p-4">
        {memory.caption && (
          <p className="max-w-full text-sm font-black text-zinc-950">{memory.caption}</p>
        )}
        {displayName && (
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-lime-mute">
            by {displayName}
          </p>
        )}
        {children && <div className="mt-3">{children}</div>}
      </div>
    </article>
  );
}

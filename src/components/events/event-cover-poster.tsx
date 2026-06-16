import { getCardDesignStyles } from "@/lib/card-design";
import { getEventTheme } from "@/lib/event-themes";
import { cn } from "@/lib/utils";

type EventCoverPosterProps = {
  title: string;
  date: string;
  time: string;
  location: string;
  host: string;
  theme?: string | null;
  coverImage?: string | null;
  cardDesign?: unknown;
  className?: string;
};

export function EventCoverPoster({
  title,
  date,
  time,
  location,
  host,
  theme,
  coverImage,
  cardDesign,
  className,
}: EventCoverPosterProps) {
  const selectedTheme = getEventTheme(theme);
  const design = getCardDesignStyles(cardDesign);

  if (coverImage) {
    return (
      <figure
        className={cn(
          "relative aspect-[4/5] min-h-[21.5rem] overflow-hidden rounded-[1.6rem] bg-white/35 shadow-[0_30px_90px_rgba(31,11,27,0.24)]",
          className,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={coverImage} alt={`${title} event cover`} className="h-full w-full object-cover" />
      </figure>
    );
  }

  return (
    <figure
      className={cn(
        "event-poster relative min-h-[25rem] overflow-hidden bg-gradient-to-br shadow-[0_30px_90px_rgba(31,11,27,0.28)]",
        design.cornerClass,
        selectedTheme.gradientClass,
        className,
      )}
      style={design.style}
    >
      {coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverImage} alt={`${title} event cover`} className={cn("absolute inset-0 h-full w-full", design.imageClass)} />
      )}
      <div className={cn("absolute inset-0", design.overlayClass)} />
      {design.textureClass && <div className={cn("absolute inset-0", design.textureClass)} />}
      <div className="absolute inset-x-5 top-5 flex flex-wrap items-center justify-between gap-2">
        <span className={cn(design.badgeClass, "bg-white/70 text-zinc-950 backdrop-blur")}>{date}</span>
        <span className={cn(design.badgeClass, "bg-white/62 text-zinc-950 backdrop-blur")}>{time}</span>
      </div>
      <figcaption className={cn("absolute inset-x-5 bottom-5 flex flex-col", design.layoutClass)}>
        <p className="text-sm font-black uppercase tracking-[0.18em]" style={design.bodyStyle}>
          hosted by {host}
        </p>
        <h2 className={cn("mt-3 text-4xl lowercase leading-[0.92] sm:text-5xl", design.fontClass)} style={design.titleStyle}>
          {title}
        </h2>
        <p className="mt-4 max-w-sm text-sm font-bold leading-6" style={design.bodyStyle}>
          {location}
        </p>
      </figcaption>
    </figure>
  );
}

type CityCardProps = {
  name: string;
  detail: string;
  count: string;
  variant: string;
};

const cityGradients: Record<string, string> = {
  plum: "from-zinc-950 via-fuchsia-900 to-rose-500",
  lime: "from-lime-300 via-emerald-500 to-zinc-950",
  blue: "from-sky-400 via-blue-700 to-fuchsia-700",
};

export function CityCard({ name, detail, count, variant }: CityCardProps) {
  return (
    <article className="tilt-card film-grain relative min-h-72 overflow-hidden rounded-[2rem] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.42)] sm:p-6">
      <div className={`absolute inset-0 bg-gradient-to-br ${cityGradients[variant] ?? cityGradients.plum}`} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="relative flex h-full min-h-60 flex-col justify-between">
        <span className="w-fit rounded-full bg-ivory px-3 py-1 text-xs font-black text-zinc-950">
          {count}
        </span>
        <div>
          <h3 className="text-4xl font-black lowercase text-white">{name}</h3>
          <p className="mt-2 max-w-xs text-sm font-semibold text-zinc-200">{detail}</p>
        </div>
      </div>
    </article>
  );
}

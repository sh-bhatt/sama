type FeatureCardProps = {
  title: string;
  description: string;
  index: number;
  featured?: boolean;
};

export function FeatureCard({ title, description, index, featured = false }: FeatureCardProps) {
  const labels = ["Invite", "RSVP", "Share", "Poll", "UPI", "Memory"];
  const swatches = [
    "from-plum-900 via-rose-300 to-saffron-200",
    "from-saffron-200 via-peach-200 to-white",
    "from-[#25D366] via-peach-200 to-ivory",
    "from-rose-200 via-plum-200 to-white",
    "from-saffron-300 via-peach-200 to-rose-100",
    "from-plum-700 via-rose-200 to-peach-100",
  ];

  return (
    <article
      className={[
        "tilt-card group relative overflow-hidden rounded-[2rem] border border-plum-950/10 bg-white/72 p-6 shadow-soft",
        featured ? "sm:col-span-2 lg:row-span-2" : "",
      ].join(" ")}
    >
      <div className="absolute -right-10 -top-10 size-32 rounded-full bg-rose-200/55 blur-2xl transition group-hover:scale-125" />
      <div className="mb-5 inline-flex rounded-full bg-peach-100 px-3 py-1 text-xs font-black text-plum-900">
        {labels[index]}
      </div>
      <div
        className={[
          "relative mb-6 overflow-hidden rounded-[1.5rem] bg-gradient-to-br shadow-soft",
          swatches[index],
          featured ? "h-52" : "h-28",
        ].join(" ")}
      >
        <div className="absolute inset-0 noise-overlay" />
        <div className="absolute bottom-4 left-4 rounded-full bg-white/72 px-3 py-1.5 text-xs font-bold text-plum-950 backdrop-blur">
          {featured ? "invite alive" : labels[index].toLowerCase()}
        </div>
        {featured ? (
          <div className="absolute right-4 top-4 space-y-2">
            {["Riya is going", "21 June winning", "UPI note visible"].map((item) => (
              <div key={item} className="rounded-full bg-white/72 px-3 py-1.5 text-xs font-bold text-plum-950">
                {item}
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <h3 className={featured ? "text-3xl font-semibold text-charcoal" : "text-xl font-semibold text-charcoal"}>
        {featured ? "Invite pages that feel alive" : title}
      </h3>
      <p className="mt-3 leading-7 text-charcoal/68">{description}</p>
    </article>
  );
}

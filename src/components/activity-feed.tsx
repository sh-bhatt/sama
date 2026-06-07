type ActivityFeedProps = {
  items: string[];
};

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={`${item}-${index}`}
          className="animate-fade-up flex items-center gap-3 rounded-2xl border border-plum-950/8 bg-white/72 px-4 py-3 shadow-soft"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <span className="grid size-9 place-items-center rounded-full bg-peach-100 text-sm font-black text-plum-900">
            {index + 1}
          </span>
          <p className="text-sm font-semibold text-charcoal/72">{item}</p>
        </div>
      ))}
    </div>
  );
}

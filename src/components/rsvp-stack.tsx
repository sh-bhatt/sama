export function RsvpStack() {
  const items = [
    { label: "Going", count: "86", className: "bg-plum-900 text-white rotate-[-3deg]" },
    { label: "Maybe", count: "14", className: "bg-saffron-200 text-plum-950 rotate-[2deg]" },
    { label: "Not going", count: "9", className: "bg-rose-100 text-plum-950 rotate-[-1deg]" },
  ];

  return (
    <div className="relative h-36 w-52">
      {items.map((item, index) => (
        <div
          key={item.label}
          className={`animate-float absolute left-0 right-0 flex items-center justify-between rounded-3xl px-5 py-4 font-bold shadow-soft ${item.className}`}
          style={{ top: `${index * 42}px`, animationDelay: `${index * 180}ms` }}
        >
          <span>{item.label}</span>
          <span>{item.count}</span>
        </div>
      ))}
    </div>
  );
}

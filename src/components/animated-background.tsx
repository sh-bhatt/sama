export function AnimatedBackground() {
  const dots = [
    "left-[8%] top-[18%]",
    "left-[18%] top-[72%]",
    "left-[46%] top-[10%]",
    "right-[14%] top-[24%]",
    "right-[8%] bottom-[18%]",
    "left-[62%] bottom-[10%]",
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="animate-shimmer absolute -left-24 top-10 size-80 rounded-full bg-rose-200/45 blur-3xl" />
      <div className="animate-float-slow absolute right-[-8rem] top-20 size-96 rounded-full bg-saffron-200/45 blur-3xl" />
      <div className="animate-float absolute bottom-[-7rem] left-1/3 size-80 rounded-full bg-plum-300/30 blur-3xl" />
      <div className="absolute inset-0 noise-overlay" />
      {dots.map((position, index) => (
        <span
          key={position}
          className={`animate-soft-pulse absolute size-2 rounded-full bg-saffron-300 ${position}`}
          style={{ animationDelay: `${index * 220}ms` }}
        />
      ))}
    </div>
  );
}

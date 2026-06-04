const marqueeItems = [
  "Farewells",
  "House parties",
  "Cafe gigs",
  "Birthdays",
  "Creator meetups",
  "Trips",
  "Workshops",
  "Open mics",
  "Game nights",
];

export function EventMarquee() {
  const repeated = [...marqueeItems, ...marqueeItems, ...marqueeItems];

  return (
    <div className="overflow-hidden border-y border-plum-950/10 bg-plum-950 py-4 text-ivory">
      <div className="animate-marquee flex w-max items-center gap-4">
        {repeated.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-4 text-lg font-semibold">
            {item}
            <span className="size-1.5 rounded-full bg-saffron-200" />
          </span>
        ))}
      </div>
    </div>
  );
}

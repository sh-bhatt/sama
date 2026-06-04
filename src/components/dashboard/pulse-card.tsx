type PulseCardProps = {
  label: string;
  value: string;
  accent: "lime" | "rose" | "blue" | "saffron";
};

const accentClasses: Record<PulseCardProps["accent"], string> = {
  lime: "text-lime-mute bg-lime-mute/10",
  rose: "text-rose-neon bg-rose-neon/10",
  blue: "text-electric bg-electric/10",
  saffron: "text-saffron-200 bg-saffron-200/10",
};

export function PulseCard({ label, value, accent }: PulseCardProps) {
  return (
    <article className="theme-panel min-w-0 rounded-[1.5rem] border p-4">
      <p className="theme-muted text-sm font-bold">{label}</p>
      <p className={`mt-3 w-fit rounded-full px-3 py-1 text-2xl font-black ${accentClasses[accent]}`}>
        {value}
      </p>
    </article>
  );
}

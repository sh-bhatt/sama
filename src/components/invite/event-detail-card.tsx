type EventDetailCardProps = {
  label: string;
  value: string;
  detail?: string;
};

export function EventDetailCard({ label, value, detail }: EventDetailCardProps) {
  return (
    <article className="rounded-[1.5rem] border border-plum-950/10 bg-white/75 p-5 shadow-soft">
      <p className="text-xs font-bold uppercase text-plum-900/60">{label}</p>
      <h3 className="mt-2 text-lg font-semibold text-charcoal">{value}</h3>
      {detail ? <p className="mt-2 text-sm text-charcoal/60">{detail}</p> : null}
    </article>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  detail: string;
};

export function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <article className="rounded-[1.5rem] border border-plum-950/10 bg-white/80 p-5 shadow-soft">
      <p className="text-sm font-semibold text-charcoal/60">{label}</p>
      <p className="mt-3 text-4xl font-semibold text-charcoal">{value}</p>
      <p className="mt-2 text-sm text-plum-900">{detail}</p>
    </article>
  );
}

type ApprovalSummaryProps = {
  approved: number;
  pending: number;
  waitlisted: number;
  rejected: number;
};

const summaryItems = [
  ["approved", "text-lime-mute"],
  ["pending", "text-saffron-200"],
  ["waitlisted", "text-electric"],
  ["rejected", "text-rose-neon"],
] as const;

export function ApprovalSummary({
  approved,
  pending,
  waitlisted,
  rejected,
}: ApprovalSummaryProps) {
  const values = { approved, pending, waitlisted, rejected };

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {summaryItems.map(([label, color]) => (
        <article key={label} className="theme-panel rounded-[1.5rem] border p-5">
          <p className="theme-muted text-xs font-black uppercase tracking-[0.14em]">
            {label}
          </p>
          <p className={`mt-2 text-3xl font-black ${color}`}>{values[label]}</p>
        </article>
      ))}
    </section>
  );
}

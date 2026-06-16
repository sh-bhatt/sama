import { formatEventDate } from "@/lib/date";

type PollResultOption = {
  id: string;
  optionDate: Date;
  label: string | null;
  votes: number;
};

type PollResultsProps = {
  options: PollResultOption[];
  compact?: boolean;
};

export function PollResults({ options, compact = false }: PollResultsProps) {
  const topVotes = Math.max(...options.map((option) => option.votes), 0);
  const totalVotes = options.reduce((total, option) => total + option.votes, 0);

  return (
    <div className="space-y-3">
      {options.map((option) => {
        const percentage = totalVotes ? Math.round((option.votes / totalVotes) * 100) : 0;
        const leading = option.votes === topVotes && option.votes > 0;

        return (
          <article key={option.id} className="rounded-2xl border border-zinc-950/10 bg-white/58 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="theme-heading font-black">
                  {option.label || formatEventDate(option.optionDate)}
                </p>
                {option.label && (
                  <p className="mt-1 text-sm font-bold text-[color:var(--muted)]">
                    {formatEventDate(option.optionDate)}
                  </p>
                )}
              </div>
              <span
                className={[
                  "shrink-0 rounded-full px-3 py-1 text-xs font-black",
                  leading ? "bg-lime-mute text-zinc-950" : "border border-zinc-950/10 bg-white/60 text-zinc-950",
                ].join(" ")}
              >
                {option.votes} votes
              </span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full border border-zinc-950/10 bg-white/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-neon to-lime-mute"
                style={{ width: `${percentage}%` }}
              />
            </div>
            {!compact && (
              <p className="mt-2 text-xs font-bold text-zinc-500">{percentage}% of poll votes</p>
            )}
          </article>
        );
      })}
    </div>
  );
}

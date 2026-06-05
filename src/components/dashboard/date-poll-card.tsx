import Link from "next/link";
import { PollResults } from "@/components/polls/poll-results";

type DatePollCardProps = {
  eventId: string;
  poll:
    | {
        question: string;
        options: Array<{
          id: string;
          optionDate: Date;
          label: string | null;
          votes: number;
        }>;
      }
    | null
    | undefined;
};

export function DatePollCard({ eventId, poll }: DatePollCardProps) {
  if (!poll) {
    return (
      <section className="theme-panel rounded-[2rem] border p-5 sm:p-6">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
          date poll
        </p>
        <h2 className="theme-heading mt-3 text-4xl font-black lowercase">
          let guests pick the best day
        </h2>
        <p className="theme-muted mt-3 font-semibold leading-7">
          Add a few possible dates and let the room vote together.
        </p>
        <Link
          href={`/dashboard/events/${eventId}/date-poll`}
          className="focus-ring theme-action mt-5 inline-flex rounded-full px-5 py-3 font-black"
        >
          Create date poll
        </Link>
      </section>
    );
  }

  return (
    <section className="theme-panel rounded-[2rem] border p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
            date poll
          </p>
          <h2 className="theme-heading mt-2 text-4xl font-black lowercase">{poll.question}</h2>
        </div>
        <Link href={`/dashboard/events/${eventId}/date-poll`} className="shrink-0 text-sm font-black text-lime-mute">
          manage poll
        </Link>
      </div>
      <div className="mt-5">
        <PollResults options={poll.options} compact />
      </div>
    </section>
  );
}

import { formatEventDateShort } from "@/lib/date";

type Activity = {
  id: string;
  type: string;
  message: string;
  createdAt: Date;
};

export function EventActivityFeed({ activities }: { activities: Activity[] }) {
  return (
    <section className="theme-panel rounded-[2rem] border p-5">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">
        activity feed
      </p>
      <div className="mt-4 space-y-3">
        {activities.length ? (
          activities.map((activity) => (
            <div key={activity.id} className="rounded-2xl border border-zinc-950/10 bg-white/58 px-4 py-3">
              <p className="text-sm font-black text-zinc-950">{activity.message}</p>
              <p className="mt-1 text-xs font-bold text-zinc-500">
                {activity.type.toLowerCase().replaceAll("_", " ")} -{" "}
                {formatEventDateShort(activity.createdAt)}
              </p>
            </div>
          ))
        ) : (
          <p className="theme-muted rounded-2xl border border-zinc-950/10 bg-white/58 px-4 py-3 text-sm font-bold">
            RSVP and host updates will appear here.
          </p>
        )}
      </div>
    </section>
  );
}

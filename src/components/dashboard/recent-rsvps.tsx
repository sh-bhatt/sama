type RecentRsvp = {
  id: string;
  name: string;
  status: string;
  eventTitle: string;
};

type RecentRsvpsProps = {
  rsvps: RecentRsvp[];
};

function statusLabel(status: string) {
  return status.toLowerCase().replace("_", " ");
}

export function RecentRsvps({ rsvps }: RecentRsvpsProps) {
  return (
    <section className="theme-panel min-w-0 rounded-[2rem] border p-5">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-electric">
        recent RSVPs
      </p>
      <div className="mt-5 space-y-3">
        {rsvps.length ? (
          rsvps.map((item, index) => (
            <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-zinc-950/10 bg-white/58 px-4 py-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-rose-neon to-lime-mute text-xs font-black text-zinc-950">
                {index + 1}
              </span>
              <p className="text-sm font-bold text-zinc-700">
                {item.name} is {statusLabel(item.status)} for{" "}
                <span className="text-zinc-950">{item.eventTitle}</span>
              </p>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-zinc-950/10 bg-white/58 px-4 py-5">
            <h3 className="theme-heading text-xl font-black lowercase">no RSVPs yet</h3>
            <p className="theme-muted mt-2 text-sm font-semibold leading-6">
              New guest replies will appear here as soon as they arrive.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

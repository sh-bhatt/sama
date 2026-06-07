import Link from "next/link";
import type { BroadcastAudience } from "@prisma/client";
import { AudienceBadge } from "@/components/broadcasts/audience-badge";

type BroadcastPreview = {
  id: string;
  title: string;
  message: string;
  audience: BroadcastAudience;
  pinned: boolean;
};

export function BroadcastsManagementCard({
  eventId,
  broadcasts,
}: {
  eventId: string;
  broadcasts: BroadcastPreview[];
}) {
  return (
    <section className="theme-panel rounded-[2rem] border p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">
            host updates
          </p>
          <h2 className="theme-heading mt-2 text-3xl font-black lowercase">
            {broadcasts.length ? "latest broadcasts" : "no broadcasts yet"}
          </h2>
        </div>
        <Link
          href={`/dashboard/events/${eventId}/broadcasts`}
          className="focus-ring theme-action inline-flex rounded-full px-5 py-3 text-sm font-black"
        >
          Post update
        </Link>
      </div>

      <div className="mt-5 space-y-3">
        {broadcasts.length ? (
          broadcasts.map((broadcast) => (
            <article key={broadcast.id} className="rounded-2xl bg-black/35 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <AudienceBadge audience={broadcast.audience} />
                {broadcast.pinned && (
                  <span className="rounded-full bg-rose-neon/14 px-3 py-1 text-xs font-black text-rose-neon">
                    pinned
                  </span>
                )}
              </div>
              <h3 className="theme-heading mt-2 font-black">{broadcast.title}</h3>
              <p className="theme-muted mt-1 line-clamp-2 text-sm font-semibold">{broadcast.message}</p>
            </article>
          ))
        ) : (
          <p className="theme-muted rounded-2xl bg-black/35 px-4 py-4 font-semibold">
            Post your first update when plans change.
          </p>
        )}
      </div>
    </section>
  );
}

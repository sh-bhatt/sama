import type { BroadcastAudience } from "@prisma/client";
import type { ReactNode } from "react";
import { formatEventDateShort } from "@/lib/date";
import { AudienceBadge } from "@/components/broadcasts/audience-badge";
import { CopyBroadcastMessageButton } from "@/components/broadcasts/copy-broadcast-message-button";

type BroadcastCardProps = {
  broadcast: {
    id: string;
    title: string;
    message: string;
    audience: BroadcastAudience;
    pinned: boolean;
    createdAt: Date;
  };
  eventTitle: string;
  inviteUrl: string;
  actions?: ReactNode;
};

export function BroadcastCard({
  broadcast,
  eventTitle,
  inviteUrl,
  actions,
}: BroadcastCardProps) {
  return (
    <article className="theme-panel rounded-[1.6rem] border p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <AudienceBadge audience={broadcast.audience} />
            {broadcast.pinned && (
              <span className="rounded-full bg-rose-neon/14 px-3 py-1 text-xs font-black text-rose-neon">
                pinned
              </span>
            )}
            <span className="theme-muted text-xs font-black uppercase tracking-[0.12em]">
              {formatEventDateShort(broadcast.createdAt)}
            </span>
          </div>
          <h2 className="theme-heading mt-3 text-2xl font-black">{broadcast.title}</h2>
          <p className="theme-muted mt-2 whitespace-pre-line font-semibold leading-7">
            {broadcast.message}
          </p>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
      <div className="mt-4">
        <CopyBroadcastMessageButton
          eventTitle={eventTitle}
          inviteUrl={inviteUrl}
          broadcastTitle={broadcast.title}
          broadcastMessage={broadcast.message}
        />
      </div>
    </article>
  );
}

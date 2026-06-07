import type { BroadcastAudience } from "@prisma/client";
import type { ReactNode } from "react";
import { BroadcastCard } from "@/components/broadcasts/broadcast-card";

type Broadcast = {
  id: string;
  title: string;
  message: string;
  audience: BroadcastAudience;
  pinned: boolean;
  createdAt: Date;
};

export function BroadcastList({
  broadcasts,
  eventTitle,
  inviteUrl,
  renderActions,
}: {
  broadcasts: Broadcast[];
  eventTitle: string;
  inviteUrl: string;
  renderActions?: (broadcast: Broadcast) => ReactNode;
}) {
  if (!broadcasts.length) {
    return (
      <section className="theme-panel rounded-[2rem] border p-6">
        <h2 className="theme-heading text-3xl font-black lowercase">no updates yet</h2>
        <p className="theme-muted mt-3 font-semibold leading-7">
          Post your first update when plans change.
        </p>
      </section>
    );
  }

  return (
    <section className="grid gap-4">
      {broadcasts.map((broadcast) => (
        <BroadcastCard
          key={broadcast.id}
          broadcast={broadcast}
          eventTitle={eventTitle}
          inviteUrl={inviteUrl}
          actions={renderActions?.(broadcast)}
        />
      ))}
    </section>
  );
}

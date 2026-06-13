"use client";

import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";

type RealtimeRefreshProps = {
  channels: string[];
  enabled?: boolean;
  label?: string;
  showIndicator?: boolean;
  userId?: string | null;
};

export function RealtimeRefresh({
  channels,
  enabled = true,
  label = "live",
  showIndicator = true,
  userId,
}: RealtimeRefreshProps) {
  const { isLive } = useRealtimeRefresh(channels, enabled, userId);

  if (!enabled || !showIndicator || channels.length === 0) {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--card)]/72 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-[color:var(--accent)]">
      <span
        className={`size-2 rounded-full bg-[color:var(--accent)] shadow-[0_0_18px_rgba(198,255,69,0.55)] ${
          isLive ? "animate-pulse" : ""
        }`}
      />
      {isLive ? "updating" : label}
    </span>
  );
}

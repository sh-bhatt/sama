"use client";

import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";

type RealtimeRefreshProps = {
  channels: string[];
  enabled?: boolean;
  label?: string;
  showIndicator?: boolean;
};

export function RealtimeRefresh({
  channels,
  enabled = true,
  label = "live",
  showIndicator = true,
}: RealtimeRefreshProps) {
  const { isLive } = useRealtimeRefresh(channels, enabled);

  if (!enabled || !showIndicator || channels.length === 0) {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-lime-mute/25 bg-black/35 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-lime-mute">
      <span
        className={`size-2 rounded-full bg-lime-mute shadow-[0_0_18px_rgba(198,255,69,0.65)] ${
          isLive ? "animate-pulse" : ""
        }`}
      />
      {isLive ? "updating" : label}
    </span>
  );
}

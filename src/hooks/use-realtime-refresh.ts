"use client";

import { useEffect, useMemo, useState } from "react";
import { Realtime, type RealtimeChannel } from "ably";
import { useRouter } from "next/navigation";
import { realtimeMessageName } from "@/lib/realtime/events";

let realtimeClient: Realtime | null = null;

function getRealtimeClient() {
  if (typeof window === "undefined") {
    return null;
  }

  realtimeClient ??= new Realtime({
    authUrl: "/api/realtime/token",
    authMethod: "GET",
  });

  return realtimeClient;
}

export function useRealtimeRefresh(channels: string[], enabled = true) {
  const router = useRouter();
  const [isLive, setIsLive] = useState(false);
  const channelKey = useMemo(
    () => [...new Set(channels.filter(Boolean))].sort().join("|"),
    [channels],
  );

  useEffect(() => {
    if (!enabled || !channelKey) {
      return;
    }

    const client = getRealtimeClient();

    if (!client) {
      return;
    }

    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    let liveTimer: ReturnType<typeof setTimeout> | null = null;
    const subscribedChannels: RealtimeChannel[] = [];

    const refresh = () => {
      setIsLive(true);

      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }

      if (liveTimer) {
        clearTimeout(liveTimer);
      }

      refreshTimer = setTimeout(() => {
        router.refresh();
      }, 500);

      liveTimer = setTimeout(() => {
        setIsLive(false);
      }, 1800);
    };

    channelKey.split("|").forEach((channelName) => {
      const channel = client.channels.get(channelName);
      subscribedChannels.push(channel);
      void channel.subscribe(realtimeMessageName, refresh);
    });

    return () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }

      if (liveTimer) {
        clearTimeout(liveTimer);
      }

      subscribedChannels.forEach((channel) => {
        channel.unsubscribe(realtimeMessageName, refresh);
      });
    };
  }, [channelKey, enabled, router]);

  return { isLive };
}

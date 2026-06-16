"use client";

import { useEffect, useMemo, useState } from "react";
import { Realtime, type RealtimeChannel } from "ably";
import { useRouter } from "next/navigation";
import { getStableRealtimeClientId } from "@/lib/realtime/client-id";
import { realtimeMessageName } from "@/lib/realtime/events";

let realtimeClientEntry: { clientId: string; client: Realtime } | null = null;

function getRealtimeClient(clientId: string) {
  if (typeof window === "undefined") {
    return null;
  }

  if (realtimeClientEntry && realtimeClientEntry.clientId !== clientId) {
    realtimeClientEntry.client.close();
    realtimeClientEntry = null;
  }

  realtimeClientEntry ??= {
    clientId,
    client: new Realtime({
      clientId,
      authUrl: `/api/realtime/token?clientId=${encodeURIComponent(clientId)}`,
      authMethod: "GET",
    }),
  };

  return realtimeClientEntry.client;
}

export function useRealtimeRefresh(channels: string[], enabled = true, clerkUserId?: string | null) {
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

    const clientId = getStableRealtimeClientId(clerkUserId);

    if (!clientId) {
      return;
    }

    const client = getRealtimeClient(clientId);

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
  }, [channelKey, enabled, router, clerkUserId]);

  return { isLive };
}

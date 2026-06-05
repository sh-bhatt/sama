import { Rest } from "ably";
import {
  realtimeMessageName,
  type RealtimeEventPayload,
} from "@/lib/realtime/events";

let ablyRest: Rest | null = null;

function getAblyRest() {
  const apiKey = process.env.ABLY_API_KEY;

  if (!apiKey) {
    return null;
  }

  ablyRest ??= new Rest({ key: apiKey });
  return ablyRest;
}

export async function publishEventUpdate(
  channels: string[],
  payload: Omit<RealtimeEventPayload, "timestamp">,
) {
  const client = getAblyRest();
  const uniqueChannels = [...new Set(channels.filter(Boolean))];

  if (!client || uniqueChannels.length === 0) {
    return;
  }

  const message: RealtimeEventPayload = {
    ...payload,
    timestamp: new Date().toISOString(),
  };

  try {
    await Promise.all(
      uniqueChannels.map((channelName) =>
        client.channels.get(channelName).publish(realtimeMessageName, message),
      ),
    );
  } catch (error) {
    console.warn("Sama realtime publish skipped:", error);
  }
}

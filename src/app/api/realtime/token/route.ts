import { Rest } from "ably";
import { auth } from "@clerk/nextjs/server";
import { isClerkConfigured } from "@/lib/auth/config";

function isValidRealtimeClientId(clientId: string) {
  return /^(user|guest):[A-Za-z0-9_-][A-Za-z0-9:._-]{1,127}$/.test(clientId);
}

export async function GET(request: Request) {
  const apiKey = process.env.ABLY_API_KEY;

  if (!apiKey) {
    return Response.json({ error: "Realtime is not configured." }, { status: 503 });
  }

  const clerkUserId = isClerkConfigured() ? (await auth()).userId : null;
  const requestedClientId = new URL(request.url).searchParams.get("clientId");
  const clientId = requestedClientId || (clerkUserId ? `user:${clerkUserId}` : null);

  if (!clientId || !isValidRealtimeClientId(clientId)) {
    return Response.json({ error: "Invalid realtime client id." }, { status: 400 });
  }

  if (clientId.startsWith("user:") && clientId !== `user:${clerkUserId}`) {
    return Response.json({ error: "Realtime client id does not match the signed-in user." }, { status: 403 });
  }

  const client = new Rest({ key: apiKey });
  const tokenRequest = await client.auth.createTokenRequest({
    clientId,
    capability: JSON.stringify({
      "event:*": ["subscribe"],
      "dashboard:*": ["subscribe"],
      "invite:*": ["subscribe"],
    }),
  });

  return Response.json(tokenRequest);
}

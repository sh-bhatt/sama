import { Rest } from "ably";
import { auth } from "@clerk/nextjs/server";
import { isClerkConfigured } from "@/lib/auth/config";

export async function GET() {
  const apiKey = process.env.ABLY_API_KEY;

  if (!apiKey) {
    return Response.json({ error: "Realtime is not configured." }, { status: 503 });
  }

  const clerkUserId = isClerkConfigured() ? (await auth()).userId : null;
  const clientId = clerkUserId || `guest:${crypto.randomUUID()}`;
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

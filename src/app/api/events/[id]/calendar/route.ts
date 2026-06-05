import { headers } from "next/headers";
import { isDatabaseConfigured } from "@/lib/auth/config";
import { createIcsContent } from "@/lib/calendar";
import { prisma } from "@/lib/prisma";

type CalendarRouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: CalendarRouteProps) {
  if (!isDatabaseConfigured()) {
    return new Response("Calendar export is not configured.", { status: 404 });
  }

  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    return new Response("Event not found.", { status: 404 });
  }

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") || "http";
  const origin = host ? `${protocol}://${host}` : "http://localhost:3000";
  const inviteUrl = `${origin}/invite/${event.slug}`;
  const ics = createIcsContent(event, inviteUrl);

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="sama-${event.slug}.ics"`,
    },
  });
}

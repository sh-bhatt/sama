import Link from "next/link";

type EventOwnerRailProps = {
  eventId: string;
};

const ownerActions = [
  { label: "Manage", href: (eventId: string) => `/dashboard/events/${eventId}` },
  { label: "Broadcast", href: (eventId: string) => `/dashboard/events/${eventId}/broadcasts` },
  { label: "Guests", href: (eventId: string) => `/dashboard/events/${eventId}` },
  { label: "Design", href: (eventId: string) => `/dashboard/events/${eventId}/design` },
  { label: "Share", href: () => "#share-tools" },
  { label: "More", href: (eventId: string) => `/dashboard/events/${eventId}` },
] as const;

export function EventOwnerRail({ eventId }: EventOwnerRailProps) {
  return (
    <>
      <nav
        aria-label="Host tools"
        className="fixed right-5 top-24 z-30 hidden w-[4.5rem] flex-col gap-1 rounded-full border border-white/18 bg-white/18 p-1 shadow-[0_14px_42px_rgba(31,11,27,0.12)] backdrop-blur-2xl xl:flex"
      >
        {ownerActions.map((action) => (
          <Link
            key={action.label}
            href={action.href(eventId)}
            className="focus-ring rounded-full px-2 py-2 text-center text-[0.64rem] font-black text-zinc-950 transition hover:bg-white/55"
          >
            {action.label}
          </Link>
        ))}
      </nav>
      <details className="relative z-30 mx-auto mt-2 max-w-7xl px-4 pb-1 sm:px-6 lg:px-8 xl:hidden">
        <summary className="focus-ring inline-flex cursor-pointer list-none rounded-full bg-white/35 px-4 py-2 text-sm font-black text-zinc-950 backdrop-blur">
          Host tools
        </summary>
        <nav aria-label="Host tools" className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {ownerActions.map((action) => (
            <Link
              key={action.label}
              href={action.href(eventId)}
              className="focus-ring shrink-0 rounded-full bg-white/45 px-4 py-2 text-sm font-black text-zinc-950 backdrop-blur"
            >
              {action.label}
            </Link>
          ))}
        </nav>
      </details>
    </>
  );
}

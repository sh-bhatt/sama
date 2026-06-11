import Link from "next/link";
import { getDisplayName } from "@/lib/profile";

type OrganizerHeroUser = {
  name: string | null;
  username: string | null;
  imageUrl: string | null;
  bio: string | null;
  location: string | null;
  instagramUrl: string | null;
  websiteUrl: string | null;
};

export function OrganizerHero({
  user,
  totalEvents,
  upcomingCount,
}: {
  user: OrganizerHeroUser;
  totalEvents: number;
  upcomingCount: number;
}) {
  const displayName = getDisplayName(user);
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <section className="film-grain relative overflow-hidden rounded-[2.4rem] bg-[radial-gradient(circle_at_20%_12%,rgba(255,46,139,0.4),transparent_25%),radial-gradient(circle_at_82%_16%,rgba(198,255,69,0.22),transparent_20%),linear-gradient(135deg,#080808,#261225,#050505)] p-7 shadow-[0_24px_90px_rgba(0,0,0,0.48)] sm:p-10">
      <div className="relative grid gap-6 md:grid-cols-[auto_minmax(0,1fr)] md:items-end">
        <div className="grid size-28 place-items-center overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose-neon to-lime-mute text-3xl font-black text-zinc-950">
          {user.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.imageUrl} alt={`${displayName} profile photo`} className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
            hosting on Sama
          </p>
          <h1 className="mt-3 max-w-4xl text-5xl font-black lowercase leading-none text-white sm:text-7xl">
            {displayName}
          </h1>
          {user.username && <p className="mt-3 text-sm font-black text-rose-200">@{user.username}</p>}
          {user.bio && <p className="mt-4 max-w-2xl text-lg font-semibold leading-8 text-zinc-300">{user.bio}</p>}
          <div className="mt-5 flex flex-wrap gap-2">
            {user.location && (
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-black text-white">
                {user.location}
              </span>
            )}
            <span className="rounded-full bg-lime-mute px-4 py-2 text-sm font-black text-zinc-950">
              {totalEvents} public events
            </span>
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-black text-white">
              {upcomingCount} upcoming
            </span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {user.instagramUrl && (
              <a href={user.instagramUrl} target="_blank" rel="noreferrer noopener" className="focus-ring rounded-full bg-white/10 px-4 py-2 text-sm font-black text-white">
                Instagram
              </a>
            )}
            {user.websiteUrl && (
              <a href={user.websiteUrl} target="_blank" rel="noreferrer noopener" className="focus-ring rounded-full bg-white/10 px-4 py-2 text-sm font-black text-white">
                Website
              </a>
            )}
            <Link href="/discover" className="focus-ring rounded-full bg-white/10 px-4 py-2 text-sm font-black text-white">
              Discover more
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

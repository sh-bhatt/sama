import Link from "next/link";
import { getDisplayName, getOrganizerHref, type OrganizerProfile } from "@/lib/profile";

type ProfileCardUser = OrganizerProfile & {
  bio?: string | null;
  location?: string | null;
  instagramUrl?: string | null;
  websiteUrl?: string | null;
};

export function ProfileCard({ user }: { user: ProfileCardUser }) {
  const displayName = getDisplayName(user);
  const href = getOrganizerHref(user);
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <section className="theme-panel rounded-[2rem] border p-5 sm:p-6">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
        public preview
      </p>
      <div className="mt-5 flex items-start gap-4">
        <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-rose-neon to-lime-mute text-lg font-black text-zinc-950">
          {user.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.imageUrl} alt={`${displayName} profile photo`} className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0">
          <h2 className="theme-heading text-3xl font-black lowercase">{displayName}</h2>
          <p className="mt-1 text-sm font-black text-rose-neon">
            {user.username ? `@${user.username}` : "choose a username"}
          </p>
          {user.location && <p className="theme-muted mt-2 text-sm font-semibold">{user.location}</p>}
        </div>
      </div>
      {user.bio && <p className="theme-muted mt-5 font-semibold leading-7">{user.bio}</p>}
      <div className="mt-5 flex flex-wrap gap-2">
        {user.instagramUrl && (
          <a
            href={user.instagramUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="focus-ring rounded-full bg-[color:var(--card)] px-4 py-2 text-sm font-black text-[color:var(--foreground)]"
          >
            Instagram
          </a>
        )}
        {user.websiteUrl && (
          <a
            href={user.websiteUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="focus-ring rounded-full bg-[color:var(--card)] px-4 py-2 text-sm font-black text-[color:var(--foreground)]"
          >
            Website
          </a>
        )}
        {href && (
          <Link
            href={href}
            className="focus-ring rounded-full bg-lime-mute px-4 py-2 text-sm font-black text-zinc-950"
          >
            Open profile
          </Link>
        )}
      </div>
      {!user.publicProfile && (
        <p className="mt-4 rounded-2xl bg-black/35 px-4 py-3 text-sm font-bold text-zinc-300">
          Public profile is off. Guests will only see your host name.
        </p>
      )}
    </section>
  );
}

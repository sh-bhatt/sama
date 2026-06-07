import Link from "next/link";

export function ProfileCompletionCard() {
  return (
    <section className="theme-panel min-w-0 rounded-[2rem] border p-5">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
        organizer profile
      </p>
      <h3 className="theme-heading mt-3 text-2xl font-black lowercase">
        complete your host page
      </h3>
      <p className="theme-muted mt-2 text-sm font-semibold leading-6">
        Add a username and bio so guests can trust the person behind the room.
      </p>
      <Link
        href="/dashboard/profile"
        className="focus-ring mt-4 inline-flex rounded-full bg-lime-mute px-4 py-2 text-sm font-black text-zinc-950"
      >
        Complete profile
      </Link>
    </section>
  );
}

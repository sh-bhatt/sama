type PublicGuest = {
  id: string;
  name: string;
  status: string;
  plusOne: boolean;
};

export function PublicGuestPreview({ guests }: { guests: PublicGuest[] }) {
  return (
    <section className="border-t border-zinc-950/10 pt-6 dark:border-white/10">
      <h2 className="text-2xl font-black lowercase text-zinc-950 dark:text-white">Guests</h2>
      {guests.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {guests.map((guest, index) => (
            <div
              key={guest.id}
              className="animate-float flex items-center gap-2 rounded-full bg-white/34 px-2.5 py-2 backdrop-blur dark:bg-white/[0.06]"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-rose-neon to-lime-mute text-xs font-black text-zinc-950">
                {guest.name.slice(0, 1).toUpperCase()}
              </span>
              <span>
                <span className="block text-sm font-black text-zinc-950 dark:text-white">{guest.name}</span>
                <span className="block text-xs text-zinc-600 dark:text-zinc-400">
                  {guest.status.toLowerCase().replace("_", " ")}
                  {guest.plusOne ? " +1" : ""}
                </span>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm font-semibold leading-6 text-zinc-700 dark:text-zinc-300">
          Be the first name on this room&apos;s list.
        </p>
      )}
    </section>
  );
}

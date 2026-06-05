type PublicGuest = {
  id: string;
  name: string;
  status: string;
  plusOne: boolean;
};

export function PublicGuestPreview({ guests }: { guests: PublicGuest[] }) {
  return (
    <section className="theme-panel rounded-[2rem] border p-5 sm:p-6">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">
        guest preview
      </p>
      {guests.length ? (
        <div className="mt-5 flex flex-wrap gap-3">
          {guests.map((guest, index) => (
            <div
              key={guest.id}
              className="animate-float flex items-center gap-3 rounded-full bg-black/42 px-3 py-2"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-rose-neon to-lime-mute text-xs font-black text-zinc-950">
                {guest.name.slice(0, 1).toUpperCase()}
              </span>
              <span>
                <span className="block text-sm font-black text-white">{guest.name}</span>
                <span className="block text-xs text-zinc-400">
                  {guest.status.toLowerCase().replace("_", " ")}
                  {guest.plusOne ? " +1" : ""}
                </span>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="theme-muted mt-4 font-semibold leading-7">
          Be the first name on this room&apos;s list.
        </p>
      )}
    </section>
  );
}

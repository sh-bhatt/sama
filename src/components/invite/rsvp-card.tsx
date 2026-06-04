export function RsvpCard() {
  return (
    <section className="rounded-[2rem] border border-plum-950/10 bg-white/92 p-5 shadow-card backdrop-blur sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-plum-900">Your RSVP</p>
          <h2 className="mt-1 text-2xl font-semibold text-charcoal">Will you be there?</h2>
        </div>
        <span className="rounded-full bg-saffron-100 px-3 py-1 text-xs font-bold text-plum-950">
          86 going
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {["Going", "Maybe", "Cant make it"].map((status, index) => (
          <button
            key={status}
            className={[
              "focus-ring rounded-2xl border px-4 py-3 text-sm font-bold transition hover:-translate-y-0.5 active:scale-[0.98]",
              index === 0
                ? "animate-soft-pulse border-plum-900 bg-plum-900 text-white"
                : "border-plum-950/10 bg-ivory text-charcoal hover:border-plum-900/30 hover:bg-peach-100",
            ].join(" ")}
            type="button"
          >
            {status}
          </button>
        ))}
      </div>

      <form className="mt-6 space-y-4">
        <div>
          <label htmlFor="guest-name" className="text-sm font-semibold text-charcoal">
            Name
          </label>
          <input
            id="guest-name"
            name="guest-name"
            placeholder="Your name"
            className="focus-ring mt-2 w-full rounded-2xl border border-plum-950/10 bg-ivory px-4 py-3 transition focus:border-plum-900/50"
          />
        </div>
        <div>
          <label htmlFor="guest-contact" className="text-sm font-semibold text-charcoal">
            Phone or email
          </label>
          <input
            id="guest-contact"
            name="guest-contact"
            placeholder="+91 or email"
            className="focus-ring mt-2 w-full rounded-2xl border border-plum-950/10 bg-ivory px-4 py-3 transition focus:border-plum-900/50"
          />
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-plum-950/10 bg-ivory px-4 py-3">
          <div>
            <p className="font-semibold text-charcoal">Bring a plus one</p>
            <p className="text-sm text-charcoal/60">Ask the host with your RSVP.</p>
          </div>
          <button
            type="button"
            aria-label="Toggle plus one"
            className="relative h-8 w-14 rounded-full bg-plum-900 shadow-inner"
          >
            <span className="absolute right-1 top-1 size-6 rounded-full bg-white shadow" />
          </button>
        </div>
        <div>
          <label htmlFor="host-note" className="text-sm font-semibold text-charcoal">
            Note to host
          </label>
          <textarea
            id="host-note"
            name="host-note"
            rows={4}
            placeholder="Song requests, food notes, or just say hi."
            className="focus-ring mt-2 w-full resize-none rounded-2xl border border-plum-950/10 bg-ivory px-4 py-3 transition focus:border-plum-900/50"
          />
        </div>
        <button
          type="button"
          className="focus-ring w-full rounded-2xl bg-plum-900 px-5 py-3 font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-plum-800"
        >
          Submit RSVP
        </button>
      </form>
    </section>
  );
}

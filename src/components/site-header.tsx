import Link from "next/link";
import { PremiumButton } from "./premium-button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-plum-950/10 bg-ivory/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Sama home">
          <span className="grid size-10 place-items-center rounded-2xl bg-plum-900 text-lg font-semibold text-ivory shadow-soft">
            S
          </span>
          <span className="text-xl font-semibold text-charcoal">Sama</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-charcoal/70 md:flex">
          <Link href="/#features" className="transition hover:text-plum-900">
            Features
          </Link>
          <Link href="/discover" className="transition hover:text-plum-900">
            Discover
          </Link>
          <Link href="/dashboard" className="transition hover:text-plum-900">
            Host Dashboard
          </Link>
        </nav>

        <PremiumButton href="/dashboard/events/new" className="px-4 py-2">
          Create an event
        </PremiumButton>
      </div>
    </header>
  );
}

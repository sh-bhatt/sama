import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { isClerkConfigured } from "@/lib/auth/config";

export const dynamic = "force-dynamic";

const clerkAppearance = {
  elements: {
    rootBox: "w-full",
    cardBox:
      "w-full max-w-md rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--card)]/90 shadow-[0_24px_90px_rgba(0,0,0,0.32)]",
    headerTitle: "text-[color:var(--foreground)]",
    headerSubtitle: "text-[color:var(--muted)]",
    socialButtonsBlockButton:
      "border-[color:var(--border)] bg-[color:var(--background)] text-[color:var(--foreground)]",
    formFieldLabel: "text-[color:var(--foreground)]",
    formFieldInput:
      "border-[color:var(--border)] bg-[color:var(--background)] text-[color:var(--foreground)]",
    footerActionText: "text-[color:var(--muted)]",
    footerActionLink: "text-[color:var(--accent-2)]",
    formButtonPrimary:
      "bg-[color:var(--accent)] text-[color:var(--accent-contrast)] hover:bg-[color:var(--accent)]",
  },
};

export default function SignInPage() {
  return (
    <main className="dark-stage min-h-screen overflow-x-hidden px-4 py-5 text-foreground sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between gap-3">
          <Link href="/" className="text-2xl font-black lowercase tracking-tight">
            Sama
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/discover" className="hidden text-sm font-black text-lime-mute sm:inline-flex">
              Discover
            </Link>
            <Link href="/dashboard/events/new" className="focus-ring rounded-full bg-lime-mute px-3 py-2 text-sm font-black text-zinc-950 sm:px-4">
              Host
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <section className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,440px)]">
          <div className="min-w-0">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
              host console
            </p>
            <h1 className="theme-heading mt-4 max-w-2xl text-5xl font-black lowercase leading-none sm:text-7xl">
              Step back into your gatherings.
            </h1>
            <p className="theme-muted mt-5 max-w-xl text-lg font-semibold leading-8">
              Your guest lists, city nights, nudges, links, and live rooms are waiting.
            </p>
          </div>

          <div className="theme-panel min-w-0 rounded-[2.25rem] border p-4 sm:p-5">
            {isClerkConfigured() ? (
              <SignIn
                appearance={clerkAppearance}
                fallbackRedirectUrl="/dashboard"
                path="/sign-in"
                routing="path"
                signUpUrl="/sign-up"
              />
            ) : (
              <div className="p-5">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">
                  Clerk setup needed
                </p>
                <h2 className="theme-heading mt-3 text-3xl font-black lowercase">
                  add auth keys to sign in
                </h2>
                <p className="theme-muted mt-3 font-semibold leading-7">
                  Add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY to
                  your local environment. Public pages still render without them.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Required to keep theme-dependent labels out of the hydration pass.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className="focus-ring flex h-10 shrink-0 items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--card)] px-2 text-xs font-black text-[color:var(--foreground)] shadow-[0_12px_38px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5"
      >
        <span className="grid size-6 place-items-center rounded-full bg-[color:var(--accent)] text-[color:var(--accent-contrast)]">
          T
        </span>
        <span className="hidden sm:inline">theme</span>
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="focus-ring flex h-10 shrink-0 items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--card)] px-2 text-xs font-black text-[color:var(--foreground)] shadow-[0_12px_38px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5"
    >
      <span className="grid size-6 place-items-center rounded-full bg-[color:var(--accent)] text-[color:var(--accent-contrast)]">
        {isDark ? "N" : "D"}
      </span>
      <span className="hidden sm:inline">{isDark ? "night" : "day"}</span>
    </button>
  );
}

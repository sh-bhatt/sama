"use client";

import { UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function ClientUserButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const mountTimer = window.setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => {
      window.clearTimeout(mountTimer);
    };
  }, []);

  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        className="size-8 rounded-full border border-zinc-950/10 bg-zinc-950/5"
      />
    );
  }

  return <UserButton />;
}

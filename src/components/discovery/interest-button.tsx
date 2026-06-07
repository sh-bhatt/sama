"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleInterestAction } from "@/app/discover/actions";
import { cn } from "@/lib/utils";

const guestIdKey = "sama-guest-id";

function createGuestId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function InterestButton({
  eventId,
  initialCount,
  initialInterested = false,
  compact = false,
}: {
  eventId: string;
  initialCount: number;
  initialInterested?: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [guestId, setGuestId] = useState("");
  const [interested, setInterested] = useState(initialInterested);
  const [count, setCount] = useState(initialCount);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const task = window.setTimeout(() => {
      let storedGuestId = localStorage.getItem(guestIdKey);

      if (!storedGuestId) {
        storedGuestId = createGuestId();
        localStorage.setItem(guestIdKey, storedGuestId);
      }

      setGuestId(storedGuestId);
      setInterested(localStorage.getItem(`sama-interest-${eventId}`) === "true");
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(task);
  }, [eventId]);

  function toggleInterest() {
    if (!guestId || isPending) {
      return;
    }

    setError("");
    const nextInterested = !interested;
    setInterested(nextInterested);
    setCount((value) => Math.max(0, value + (nextInterested ? 1 : -1)));

    const formData = new FormData();
    formData.set("eventId", eventId);
    formData.set("guestId", guestId);

    startTransition(async () => {
      const result = await toggleInterestAction(formData);

      if (!result.ok) {
        setInterested(interested);
        setCount(initialCount);
        setError(result.error);
        return;
      }

      localStorage.setItem(`sama-interest-${eventId}`, String(result.interested));
      setInterested(result.interested);
      setCount(result.count);
      router.refresh();
    });
  }

  return (
    <div className="min-w-0">
      <button
        type="button"
        aria-pressed={mounted ? interested : false}
        disabled={!mounted || isPending}
        onClick={toggleInterest}
        className={cn(
          "focus-ring inline-flex items-center justify-center gap-2 rounded-full font-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70",
          compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm",
          mounted && interested
            ? "bg-lime-mute text-zinc-950"
            : "bg-[color:var(--card)] text-[color:var(--foreground)] hover:brightness-110",
        )}
      >
        <span>{mounted && interested ? "interested" : "interest"}</span>
        <span className={mounted && interested ? "text-zinc-800" : "text-lime-mute"}>
          {count}
        </span>
      </button>
      {error && <p className="mt-2 text-xs font-bold text-rose-neon">{error}</p>}
    </div>
  );
}

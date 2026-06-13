"use client";

import { cn } from "@/lib/utils";

export type RsvpChoiceStatus = "GOING" | "MAYBE" | "NOT_GOING";

type RsvpChoiceButtonsProps = {
  selectedStatus?: RsvpChoiceStatus;
  disabled?: boolean;
  goingDisabled?: boolean;
  onSelect?: (status: RsvpChoiceStatus) => void;
  size?: "compact" | "hero";
  className?: string;
};

const choices = [
  { value: "GOING", label: "Going", mark: "Y", tone: "from-lime-mute via-ivory to-saffron-200" },
  { value: "MAYBE", label: "Maybe", mark: "?", tone: "from-ivory via-pink-100 to-fuchsia-200" },
  { value: "NOT_GOING", label: "Can't Go", mark: "N", tone: "from-rose-100 via-ivory to-stone-200" },
] as const;

export function RsvpChoiceButtons({
  selectedStatus,
  disabled = false,
  goingDisabled = false,
  onSelect,
  size = "hero",
  className,
}: RsvpChoiceButtonsProps) {
  return (
    <div className={cn("grid grid-cols-3 gap-1.5 sm:gap-2.5", className)}>
      {choices.map((choice) => {
        const choiceDisabled = disabled || (goingDisabled && choice.value === "GOING");
        const active = selectedStatus === choice.value;

        return (
          <button
            key={choice.value}
            type="button"
            disabled={choiceDisabled}
            aria-pressed={active}
            onClick={() => onSelect?.(choice.value)}
            className={cn(
              "focus-ring group grid place-items-center rounded-full border font-black shadow-[0_18px_55px_rgba(0,0,0,0.16)] transition duration-300 active:scale-95",
              size === "hero"
                ? "aspect-square min-h-[5.5rem] w-full max-w-24 justify-self-center p-2.5 sm:min-h-24 sm:max-w-[7.25rem] sm:p-3"
                : "aspect-square min-h-16 w-full max-w-[4.75rem] justify-self-center p-2.5",
              active
                ? "border-zinc-950/20 bg-gradient-to-br text-zinc-950"
                : "border-white/35 bg-white/42 text-zinc-950 backdrop-blur-xl hover:-translate-y-1 hover:bg-white/70 dark:border-white/12 dark:bg-white/10 dark:text-white dark:hover:bg-white/16",
              active && choice.tone,
              choiceDisabled && "cursor-not-allowed opacity-45 hover:translate-y-0",
            )}
          >
            <span
              className={cn(
                "leading-none",
                size === "hero" ? "text-2xl sm:text-3xl" : "text-xl",
                active ? "text-zinc-950" : "text-zinc-950/80 dark:text-white",
              )}
              aria-hidden="true"
            >
              {choice.mark}
            </span>
            <span className={cn("mt-1.5 text-center", size === "hero" ? "text-xs sm:text-sm" : "text-[0.68rem]")}>
              {choice.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

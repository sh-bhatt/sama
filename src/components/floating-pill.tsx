import { cn } from "@/lib/utils";

type FloatingPillProps = {
  children: React.ReactNode;
  className?: string;
  delay?: string;
};

export function FloatingPill({ children, className, delay = "0ms" }: FloatingPillProps) {
  return (
    <div
      className={cn(
        "animate-float rounded-full border border-white/70 bg-white/78 px-4 py-2 text-sm font-bold text-plum-950 shadow-soft backdrop-blur-xl",
        className,
      )}
      style={{ animationDelay: delay }}
    >
      {children}
    </div>
  );
}

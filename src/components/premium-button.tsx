import Link from "next/link";
import { cn } from "@/lib/utils";

type PremiumButtonProps = {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "whatsapp";
  className?: string;
  type?: "button" | "submit";
};

export function PremiumButton({
  children,
  href,
  variant = "primary",
  className,
  type = "button",
}: PremiumButtonProps) {
  const classes = cn(
    "focus-ring inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-bold shadow-soft transition hover:-translate-y-0.5 active:translate-y-0",
    variant === "primary" &&
      "bg-plum-900 text-white hover:bg-plum-800 hover:shadow-card",
    variant === "secondary" &&
      "border border-plum-950/12 bg-white/75 text-charcoal hover:border-plum-900/30",
    variant === "whatsapp" && "bg-[#25D366] text-white hover:brightness-95",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes}>
      {children}
    </button>
  );
}

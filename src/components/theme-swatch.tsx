import { cn } from "@/lib/utils";

type ThemeSwatchProps = {
  name: string;
  active?: boolean;
  gradient: string;
};

export function ThemeSwatch({ name, active = false, gradient }: ThemeSwatchProps) {
  return (
    <button
      type="button"
      className={cn(
        "focus-ring rounded-[1.35rem] border p-2 text-left transition hover:-translate-y-0.5",
        active ? "border-plum-900 bg-white shadow-soft" : "border-plum-950/10 bg-ivory",
      )}
    >
      <span className={cn("block h-16 rounded-2xl bg-gradient-to-br", gradient)} />
      <span className="mt-2 block text-sm font-bold text-charcoal">{name}</span>
    </button>
  );
}

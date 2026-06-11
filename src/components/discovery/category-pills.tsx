type CategoryPillsProps = {
  categories: string[];
  tone?: "dark" | "light";
};

export function CategoryPills({ categories, tone = "dark" }: CategoryPillsProps) {
  const isLight = tone === "light";

  return (
    <div className="scroll-row overflow-x-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-max max-w-7xl gap-3 lg:w-full lg:justify-center">
        {categories.map((category, index) => (
          <button
            key={category}
            type="button"
            className={[
              "focus-ring shrink-0 rounded-full border px-5 py-3 text-sm font-black transition hover:-translate-y-0.5",
              index === 0 && !isLight
                ? "border-[color:var(--foreground)] bg-[color:var(--foreground)] text-[color:var(--background)]"
                : "",
              index !== 0 && !isLight
                ? "border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground)] hover:brightness-110"
                : "",
              index === 0 && isLight
                ? "theme-editorial-action border-transparent"
                : "",
              index !== 0 && isLight
                ? "border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground)] hover:brightness-105"
                : "",
            ].join(" ")}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}

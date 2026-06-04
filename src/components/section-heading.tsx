type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  copy?: string;
};

export function SectionHeading({ eyebrow, title, copy }: SectionHeadingProps) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-plum-900/62">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-4xl font-semibold leading-tight text-charcoal sm:text-5xl">
        {title}
      </h2>
      {copy ? <p className="mt-4 text-lg leading-8 text-charcoal/66">{copy}</p> : null}
    </div>
  );
}

type ShareWhatsAppButtonProps = {
  href: string;
  className?: string;
  label?: string;
};

export function ShareWhatsAppButton({
  href,
  className,
  label = "WhatsApp share",
}: ShareWhatsAppButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={
        className ||
        "focus-ring rounded-full bg-[#25D366] px-4 py-2 text-sm font-black text-zinc-950 transition hover:-translate-y-0.5"
      }
    >
      {label}
    </a>
  );
}

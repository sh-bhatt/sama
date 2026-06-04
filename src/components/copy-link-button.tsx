"use client";

import { useState } from "react";

type CopyLinkButtonProps = {
  value: string;
  className?: string;
};

export function CopyLinkButton({ value, className }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        window.prompt("Copy invite link", value);
      }

      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy invite link", value);
    }
  }

  return (
    <button
      type="button"
      onClick={copyLink}
      className={
        className ||
        "focus-ring rounded-full bg-[color:var(--card)] px-4 py-2 text-sm font-black text-[color:var(--foreground)] transition hover:-translate-y-0.5"
      }
    >
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}

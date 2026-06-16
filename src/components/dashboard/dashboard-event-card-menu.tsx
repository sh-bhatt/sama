"use client";

import Link from "next/link";
import { useState } from "react";

type DashboardEventCardMenuProps = {
  inviteUrl: string;
  manageHref: string;
};

export function DashboardEventCardMenu({ inviteUrl, manageHref }: DashboardEventCardMenuProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyInviteLink() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(inviteUrl);
      } else {
        window.prompt("Copy invite link", inviteUrl);
      }

      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt("Copy invite link", inviteUrl);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-label="Event actions"
        onClick={() => setOpen((value) => !value)}
        className="focus-ring grid size-8 place-items-center rounded-full bg-white/84 text-lg font-black leading-none text-zinc-800 shadow-[0_8px_20px_rgba(0,0,0,0.10)] backdrop-blur transition hover:bg-white hover:text-zinc-950"
      >
        ...
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-30 w-36 overflow-hidden rounded-2xl border border-zinc-950/10 bg-[#fffaf3]/96 p-1.5 text-left shadow-[0_18px_44px_rgba(77,23,52,0.16)] backdrop-blur">
          <button
            type="button"
            onClick={copyInviteLink}
            className="focus-ring block w-full rounded-xl px-3 py-2 text-left text-xs font-black text-zinc-700 transition hover:bg-plum/8 hover:text-zinc-950"
          >
            {copied ? "Copied" : "Copy link"}
          </button>
          <Link
            href={manageHref}
            className="focus-ring block rounded-xl px-3 py-2 text-xs font-black text-zinc-700 transition hover:bg-plum/8 hover:text-zinc-950"
          >
            Manage
          </Link>
        </div>
      )}
    </div>
  );
}

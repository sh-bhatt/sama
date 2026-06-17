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
        className="focus-ring grid size-8 place-items-center rounded-full border border-white/35 bg-white/45 text-zinc-900 shadow-[0_6px_14px_rgba(39,25,35,0.10)] backdrop-blur-md transition hover:bg-white/64 hover:text-zinc-950"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-[17px]"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.4"
        >
          <circle cx="5" cy="12" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-30 w-36 overflow-hidden rounded-[10px] border border-zinc-950/10 bg-[#fffaf3]/96 p-1.5 text-left shadow-[0_18px_44px_rgba(77,23,52,0.16)] backdrop-blur">
          <button
            type="button"
            onClick={copyInviteLink}
            className="focus-ring block w-full rounded-[8px] px-3 py-2 text-left text-xs font-black text-zinc-700 transition hover:bg-plum/8 hover:text-zinc-950"
          >
            {copied ? "Copied" : "Copy link"}
          </button>
          <Link
            href={manageHref}
            className="focus-ring block rounded-[8px] px-3 py-2 text-xs font-black text-zinc-700 transition hover:bg-plum/8 hover:text-zinc-950"
          >
            Manage
          </Link>
        </div>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import {
  createBroadcastWhatsAppText,
  createWhatsAppTextUrl,
} from "@/lib/whatsapp";

type CopyBroadcastMessageButtonProps = {
  eventTitle: string;
  inviteUrl: string;
  broadcastTitle: string;
  broadcastMessage: string;
};

export function CopyBroadcastMessageButton({
  eventTitle,
  inviteUrl,
  broadcastTitle,
  broadcastMessage,
}: CopyBroadcastMessageButtonProps) {
  const [copied, setCopied] = useState(false);
  const message = useMemo(
    () =>
      createBroadcastWhatsAppText({
        eventTitle,
        inviteUrl,
        broadcastTitle,
        broadcastMessage,
      }),
    [broadcastMessage, broadcastTitle, eventTitle, inviteUrl],
  );
  const whatsappUrl = createWhatsAppTextUrl(message);

  async function copyMessage() {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={copyMessage}
        className="focus-ring rounded-full bg-[color:var(--card)] px-4 py-2 text-sm font-black text-[color:var(--foreground)] transition hover:-translate-y-0.5"
      >
        {copied ? "Copied" : "Copy WhatsApp text"}
      </button>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="focus-ring rounded-full bg-lime-mute px-4 py-2 text-sm font-black text-zinc-950 transition hover:-translate-y-0.5"
      >
        Open WhatsApp
      </a>
    </div>
  );
}

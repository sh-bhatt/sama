"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { CopyLinkButton } from "@/components/copy-link-button";

type QrCodeCardProps = {
  value: string;
  title?: string;
  description?: string;
};

export function QrCodeCard({
  value,
  title = "Scan to open invite",
  description = "A quick doorway into this Sama room.",
}: QrCodeCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    QRCode.toDataURL(value, {
      margin: 1,
      width: 320,
      color: {
        dark: "#050505",
        light: "#fffaf1",
      },
    })
      .then((dataUrl) => {
        if (!cancelled) {
          setQrDataUrl(dataUrl);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [value]);

  return (
    <section className="theme-panel min-w-0 overflow-hidden rounded-[2rem] border p-5">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-mute">
        {title}
      </p>
      <p className="theme-muted mt-2 text-sm font-semibold leading-6">{description}</p>
      <div className="mt-5 rounded-[1.5rem] bg-ivory p-4">
        <div className="grid aspect-square place-items-center rounded-[1.1rem] bg-[#fffaf1]">
          {error ? (
            <p className="px-4 text-center text-sm font-black text-zinc-950">
              QR could not be generated.
            </p>
          ) : qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt="QR code" className="size-full rounded-xl" />
          ) : (
            <p className="text-sm font-black text-zinc-950">Generating QR</p>
          )}
        </div>
      </div>
      <p className="theme-muted mt-4 break-all text-xs font-semibold">{value}</p>
      <div className="mt-4">
        <CopyLinkButton value={value} />
      </div>
    </section>
  );
}

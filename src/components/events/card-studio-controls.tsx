"use client";

import { useState } from "react";
import {
  badgeStyleOptions,
  cornerStyleOptions,
  defaultCardDesign,
  fontStyleOptions,
  imageFitOptions,
  layoutStyleOptions,
  normalizeCardDesign,
  overlayIntensityOptions,
  overlayStyleOptions,
  textureOptions,
  type CardDesign,
} from "@/lib/card-design";
import { cn } from "@/lib/utils";

type CardStudioControlsProps = {
  value?: unknown;
  onChange?: (design: CardDesign) => void;
};

const labels: Record<string, string> = {
  bold: "Bold",
  editorial: "Editorial",
  groovy: "Groovy",
  minimal: "Minimal",
  mono: "Mono",
  handwritten: "Handwritten",
  none: "None",
  "soft-dark": "Soft dark",
  "deep-dark": "Deep dark",
  "warm-glow": "Warm glow",
  "neon-vignette": "Neon vignette",
  low: "Low",
  medium: "Medium",
  high: "High",
  classic: "Classic",
  "center-stage": "Center",
  split: "Split",
  poster: "Poster",
  magazine: "Magazine",
  pill: "Pill",
  stamp: "Stamp",
  glass: "Glass",
  rounded: "Rounded",
  soft: "Soft",
  sharp: "Sharp",
  ticket: "Ticket",
  grain: "Grain",
  dots: "Dots",
  glow: "Glow",
  cover: "Cover",
  contain: "Contain",
};

function optionLabel(value: string) {
  return labels[value] || value;
}

function OptionGroup<Key extends keyof CardDesign>({
  label,
  field,
  options,
  design,
  update,
}: {
  label: string;
  field: Key;
  options: readonly CardDesign[Key][];
  design: CardDesign;
  update: (field: Key, value: CardDesign[Key]) => void;
}) {
  return (
    <div>
      <p className="theme-muted text-sm font-black">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = design[field] === option;

          return (
            <button
              key={String(option)}
              type="button"
              aria-pressed={selected}
              onClick={() => update(field, option)}
              className={cn(
                "focus-ring rounded-full px-3 py-2 text-xs font-black transition hover:-translate-y-0.5",
                selected
                  ? "bg-lime-mute text-zinc-950"
                  : "bg-black/35 text-[color:var(--foreground)] hover:bg-black/50",
              )}
            >
              {optionLabel(String(option))}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ColorControl({
  label,
  field,
  design,
  update,
}: {
  label: string;
  field: "titleColor" | "bodyColor" | "accentColor";
  design: CardDesign;
  update: (field: "titleColor" | "bodyColor" | "accentColor", value: string) => void;
}) {
  return (
    <label>
      <span className="theme-muted text-sm font-black">{label}</span>
      <span className="mt-2 flex gap-2">
        <input
          type="color"
          value={design[field]}
          onChange={(event) => update(field, event.target.value)}
          className="focus-ring h-12 w-14 shrink-0 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-1"
          aria-label={`${label} picker`}
        />
        <input
          value={design[field]}
          onChange={(event) => update(field, event.target.value)}
          className="focus-ring min-w-0 flex-1 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-2 text-sm font-black text-[color:var(--foreground)]"
          aria-label={`${label} hex value`}
        />
      </span>
    </label>
  );
}

export function CardStudioControls({ value, onChange }: CardStudioControlsProps) {
  const [design, setDesign] = useState<CardDesign>(() => normalizeCardDesign(value));

  function update<Key extends keyof CardDesign>(field: Key, value: CardDesign[Key]) {
    const next = normalizeCardDesign({ ...design, [field]: value });
    setDesign(next);
    onChange?.(next);
  }

  function reset() {
    setDesign(defaultCardDesign);
    onChange?.(defaultCardDesign);
  }

  return (
    <section className="theme-panel rounded-[2rem] border p-5 sm:p-7">
      {Object.entries(design).map(([key, fieldValue]) => (
        <input key={key} type="hidden" name={`cardDesign.${key}`} value={String(fieldValue)} />
      ))}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-rose-neon">
            Card Studio
          </p>
          <h2 className="theme-heading mt-2 text-3xl font-black lowercase">
            tune the invite poster
          </h2>
          <p className="theme-muted mt-2 text-sm font-semibold">
            Use high-contrast colors for readable cards.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="focus-ring w-fit rounded-full bg-[color:var(--card)] px-4 py-2 text-sm font-black text-[color:var(--foreground)] transition hover:-translate-y-0.5"
        >
          Reset
        </button>
      </div>

      <div className="mt-6 grid gap-5">
        <OptionGroup label="Font style" field="fontStyle" options={fontStyleOptions} design={design} update={update} />
        <div className="grid gap-4 sm:grid-cols-3">
          <ColorControl label="Title color" field="titleColor" design={design} update={update} />
          <ColorControl label="Body color" field="bodyColor" design={design} update={update} />
          <ColorControl label="Accent color" field="accentColor" design={design} update={update} />
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <OptionGroup label="Layout" field="layoutStyle" options={layoutStyleOptions} design={design} update={update} />
          <OptionGroup label="Overlay" field="overlayStyle" options={overlayStyleOptions} design={design} update={update} />
          <OptionGroup label="Overlay strength" field="overlayIntensity" options={overlayIntensityOptions} design={design} update={update} />
          <OptionGroup label="Badges" field="badgeStyle" options={badgeStyleOptions} design={design} update={update} />
          <OptionGroup label="Corners" field="cornerStyle" options={cornerStyleOptions} design={design} update={update} />
          <OptionGroup label="Texture" field="texture" options={textureOptions} design={design} update={update} />
          <OptionGroup label="Image fit" field="imageFit" options={imageFitOptions} design={design} update={update} />
        </div>
      </div>
    </section>
  );
}

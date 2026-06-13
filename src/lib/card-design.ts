import type { CSSProperties } from "react";
import { z } from "zod";
import { cn } from "@/lib/utils";

export const fontStyleOptions = ["bold", "editorial", "groovy", "minimal", "mono", "handwritten"] as const;
export const overlayStyleOptions = ["none", "soft-dark", "deep-dark", "warm-glow", "neon-vignette"] as const;
export const overlayIntensityOptions = ["low", "medium", "high"] as const;
export const layoutStyleOptions = ["classic", "center-stage", "split", "poster", "magazine"] as const;
export const badgeStyleOptions = ["pill", "stamp", "glass", "minimal"] as const;
export const cornerStyleOptions = ["rounded", "soft", "sharp", "ticket"] as const;
export const textureOptions = ["none", "grain", "dots", "glow"] as const;
export const imageFitOptions = ["cover", "contain"] as const;

const hexColorSchema = z.string().trim().regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);

export const cardDesignSchema = z.object({
  fontStyle: z.enum(fontStyleOptions),
  titleColor: hexColorSchema,
  bodyColor: hexColorSchema,
  accentColor: hexColorSchema,
  overlayStyle: z.enum(overlayStyleOptions),
  overlayIntensity: z.enum(overlayIntensityOptions),
  layoutStyle: z.enum(layoutStyleOptions),
  badgeStyle: z.enum(badgeStyleOptions),
  cornerStyle: z.enum(cornerStyleOptions),
  texture: z.enum(textureOptions),
  imageFit: z.enum(imageFitOptions),
});

export type CardDesign = z.infer<typeof cardDesignSchema>;

export const defaultCardDesign: CardDesign = {
  fontStyle: "bold",
  titleColor: "#FFFFFF",
  bodyColor: "#F5F0E8",
  accentColor: "#C6FF3D",
  overlayStyle: "soft-dark",
  overlayIntensity: "medium",
  layoutStyle: "classic",
  badgeStyle: "pill",
  cornerStyle: "rounded",
  texture: "grain",
  imageFit: "cover",
};

function readObject(input: unknown) {
  if (!input) {
    return {};
  }

  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }

  return typeof input === "object" && !Array.isArray(input) ? input : {};
}

export function normalizeCardDesign(input: unknown): CardDesign {
  const result = cardDesignSchema.safeParse({
    ...defaultCardDesign,
    ...readObject(input),
  });

  return result.success ? result.data : defaultCardDesign;
}

export function parseCardDesignFormData(formData: FormData) {
  return normalizeCardDesign({
    fontStyle: formData.get("cardDesign.fontStyle"),
    titleColor: formData.get("cardDesign.titleColor"),
    bodyColor: formData.get("cardDesign.bodyColor"),
    accentColor: formData.get("cardDesign.accentColor"),
    overlayStyle: formData.get("cardDesign.overlayStyle"),
    overlayIntensity: formData.get("cardDesign.overlayIntensity"),
    layoutStyle: formData.get("cardDesign.layoutStyle"),
    badgeStyle: formData.get("cardDesign.badgeStyle"),
    cornerStyle: formData.get("cardDesign.cornerStyle"),
    texture: formData.get("cardDesign.texture"),
    imageFit: formData.get("cardDesign.imageFit"),
  });
}

const fontClasses: Record<CardDesign["fontStyle"], string> = {
  bold: "font-black tracking-tight",
  editorial: "font-serif font-black tracking-normal",
  groovy: "font-black tracking-wide",
  minimal: "font-semibold tracking-normal",
  mono: "font-mono font-black tracking-tight",
  handwritten: "font-serif italic font-black tracking-normal",
};

const overlayClasses: Record<CardDesign["overlayStyle"], Record<CardDesign["overlayIntensity"], string>> = {
  none: {
    low: "bg-transparent",
    medium: "bg-transparent",
    high: "bg-transparent",
  },
  "soft-dark": {
    low: "bg-gradient-to-t from-black/58 via-black/10 to-transparent",
    medium: "bg-gradient-to-t from-black/74 via-black/18 to-transparent",
    high: "bg-gradient-to-t from-black/88 via-black/30 to-black/8",
  },
  "deep-dark": {
    low: "bg-gradient-to-t from-black/72 via-black/24 to-black/8",
    medium: "bg-gradient-to-t from-black/86 via-black/42 to-black/14",
    high: "bg-gradient-to-t from-black/95 via-black/58 to-black/24",
  },
  "warm-glow": {
    low: "bg-[radial-gradient(circle_at_20%_15%,rgba(245,158,11,0.24),transparent_28%),linear-gradient(to_top,rgba(0,0,0,0.62),rgba(0,0,0,0.08))]",
    medium: "bg-[radial-gradient(circle_at_20%_15%,rgba(245,158,11,0.34),transparent_30%),linear-gradient(to_top,rgba(0,0,0,0.76),rgba(0,0,0,0.16))]",
    high: "bg-[radial-gradient(circle_at_20%_15%,rgba(245,158,11,0.44),transparent_32%),linear-gradient(to_top,rgba(0,0,0,0.9),rgba(0,0,0,0.28))]",
  },
  "neon-vignette": {
    low: "bg-[radial-gradient(circle_at_84%_18%,rgba(198,255,69,0.22),transparent_22%),linear-gradient(to_top,rgba(0,0,0,0.62),rgba(0,0,0,0.08))]",
    medium: "bg-[radial-gradient(circle_at_84%_18%,rgba(198,255,69,0.32),transparent_24%),radial-gradient(circle_at_18%_18%,rgba(255,46,139,0.24),transparent_24%),linear-gradient(to_top,rgba(0,0,0,0.78),rgba(0,0,0,0.16))]",
    high: "bg-[radial-gradient(circle_at_84%_18%,rgba(198,255,69,0.42),transparent_26%),radial-gradient(circle_at_18%_18%,rgba(255,46,139,0.34),transparent_26%),linear-gradient(to_top,rgba(0,0,0,0.92),rgba(0,0,0,0.3))]",
  },
};

const cornerClasses: Record<CardDesign["cornerStyle"], string> = {
  rounded: "rounded-[1.6rem]",
  soft: "rounded-[2.4rem]",
  sharp: "rounded-lg",
  ticket: "rounded-[1.4rem] [clip-path:polygon(0_0,100%_0,100%_88%,94%_100%,0_100%)]",
};

const badgeClasses: Record<CardDesign["badgeStyle"], string> = {
  pill: "rounded-full px-3 py-1 text-xs font-black",
  stamp: "rounded-md border border-current px-3 py-1 text-xs font-black uppercase tracking-[0.14em] rotate-[-2deg]",
  glass: "rounded-full border border-white/18 bg-white/12 px-3 py-1 text-xs font-black backdrop-blur",
  minimal: "rounded-none border-b border-current px-1 py-0.5 text-xs font-black uppercase tracking-[0.14em]",
};

const layoutClasses: Record<CardDesign["layoutStyle"], string> = {
  classic: "items-start text-left",
  "center-stage": "items-center text-center",
  split: "items-start text-left",
  poster: "items-start text-left uppercase",
  magazine: "items-start text-left",
};

const textureClasses: Record<CardDesign["texture"], string> = {
  none: "",
  grain: "film-grain",
  dots: "bg-[radial-gradient(circle,rgba(255,255,255,0.18)_1px,transparent_1px)] bg-[length:18px_18px] opacity-30",
  glow: "bg-[radial-gradient(circle_at_75%_18%,rgba(198,255,69,0.22),transparent_24%),radial-gradient(circle_at_18%_80%,rgba(255,46,139,0.2),transparent_24%)]",
};

export function getCardDesignStyles(input: unknown) {
  const design = normalizeCardDesign(input);
  const style = {
    "--card-title-color": design.titleColor,
    "--card-body-color": design.bodyColor,
    "--card-accent-color": design.accentColor,
  } as CSSProperties;

  return {
    design,
    style,
    fontClass: fontClasses[design.fontStyle],
    overlayClass: overlayClasses[design.overlayStyle][design.overlayIntensity],
    cornerClass: cornerClasses[design.cornerStyle],
    badgeClass: badgeClasses[design.badgeStyle],
    layoutClass: layoutClasses[design.layoutStyle],
    textureClass: textureClasses[design.texture],
    imageClass: design.imageFit === "contain" ? "object-contain bg-black" : "object-cover",
    titleStyle: { color: "var(--card-title-color)" } as CSSProperties,
    bodyStyle: { color: "var(--card-body-color)" } as CSSProperties,
    accentStyle: { color: "var(--card-accent-color)" } as CSSProperties,
    accentBackgroundStyle: { backgroundColor: "var(--card-accent-color)" } as CSSProperties,
    cardClass: cn(fontClasses[design.fontStyle], cornerClasses[design.cornerStyle]),
  };
}

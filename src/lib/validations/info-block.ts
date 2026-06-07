import { z } from "zod";

export const maxInfoBlocksPerEvent = 8;

export const infoBlockInputSchema = z
  .object({
    eventId: z.string().trim().min(1, "Event is missing."),
    type: z.enum(["TEXT", "LINK", "FAQ", "NOTE"]).default("TEXT"),
    title: z
      .string()
      .trim()
      .min(2, "Title must be at least 2 characters.")
      .max(80, "Keep titles under 80 characters."),
    content: z
      .string()
      .trim()
      .min(1, "Content is required.")
      .max(500, "Keep content under 500 characters."),
    url: z.preprocess(
      (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
      z.string().trim().url("Use a valid URL.").optional(),
    ),
    sortOrder: z.preprocess(
      (value) => {
        if (typeof value !== "string" || value.trim() === "") {
          return 0;
        }

        return Number(value);
      },
      z.number().int().min(0).max(99).default(0),
    ),
  })
  .refine((value) => value.type !== "LINK" || Boolean(value.url), {
    message: "Link blocks need a valid URL.",
    path: ["url"],
  });

export type InfoBlockInput = z.infer<typeof infoBlockInputSchema>;

export function parseInfoBlockFormData(formData: FormData) {
  return infoBlockInputSchema.safeParse({
    eventId: formData.get("eventId"),
    type: formData.get("type") || "TEXT",
    title: formData.get("title"),
    content: formData.get("content"),
    url: formData.get("url"),
    sortOrder: formData.get("sortOrder"),
  });
}

import { z } from "zod";

export const maxBroadcastsPerEvent = 30;

export const broadcastInputSchema = z.object({
  eventId: z.string().trim().min(1, "Event is missing."),
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(80, "Keep titles under 80 characters."),
  message: z
    .string()
    .trim()
    .min(5, "Message must be at least 5 characters.")
    .max(500, "Keep updates under 500 characters."),
  audience: z
    .enum(["ALL", "GOING", "MAYBE", "APPROVED", "PENDING", "WAITLISTED"])
    .default("ALL"),
  pinned: z.preprocess((value) => value === "on" || value === "true", z.boolean()),
});

export type BroadcastInput = z.infer<typeof broadcastInputSchema>;

export function parseBroadcastFormData(formData: FormData) {
  return broadcastInputSchema.safeParse({
    eventId: formData.get("eventId"),
    title: formData.get("title"),
    message: formData.get("message"),
    audience: formData.get("audience") || "ALL",
    pinned: formData.get("pinned"),
  });
}

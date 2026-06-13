import { z } from "zod";
import { eventThemeKeys } from "@/lib/event-themes";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional(),
);

const optionalPositiveInteger = z.preprocess(
  (value) => {
    if (typeof value !== "string" || value.trim() === "") {
      return undefined;
    }

    return Number(value);
  },
  z.number().int().positive().optional(),
);

const durationHours = z.preprocess(
  (value) => {
    if (typeof value !== "string" || value.trim() === "") {
      return 6;
    }

    return Number(value);
  },
  z.union([z.literal(2), z.literal(4), z.literal(6), z.literal(8), z.literal(24)]),
);

export const eventInputSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters."),
  description: optionalText,
  eventDate: z
    .string()
    .trim()
    .min(1, "Event date is required.")
    .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)), {
      message: "Use a valid event date.",
    }),
  eventTime: z.string().trim().min(1, "Event time is required."),
  location: z.string().trim().min(1, "Location is required."),
  city: optionalText,
  category: optionalText,
  theme: z.preprocess(
    (value) => (typeof value === "string" && value.trim() !== "" ? value : undefined),
    z.enum(eventThemeKeys).default("mehfil"),
  ),
  visibility: z.enum(["public", "private"]).default("public"),
  capacity: optionalPositiveInteger,
  allowPlusOne: z.preprocess((value) => value === "on" || value === "true", z.boolean()),
  requiresApproval: z.preprocess((value) => value === "on" || value === "true", z.boolean()),
  waitlistEnabled: z.preprocess((value) => value === "on" || value === "true", z.boolean()),
  upiId: optionalText,
  paymentNote: optionalText,
  durationHours,
});

export type EventInput = z.infer<typeof eventInputSchema>;

export function parseEventFormData(formData: FormData) {
  return eventInputSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    eventDate: formData.get("eventDate"),
    eventTime: formData.get("eventTime"),
    location: formData.get("location"),
    city: formData.get("city"),
    category: formData.get("category"),
    theme: formData.get("theme"),
    visibility: formData.get("visibility") || "public",
    capacity: formData.get("capacity"),
    allowPlusOne: formData.get("allowPlusOne"),
    requiresApproval: formData.get("requiresApproval"),
    waitlistEnabled: formData.get("waitlistEnabled") ?? "true",
    upiId: formData.get("upiId"),
    paymentNote: formData.get("paymentNote"),
    durationHours: formData.get("durationHours"),
  });
}

export function eventDateStringToDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

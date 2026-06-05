import { z } from "zod";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional(),
);

const optionalEmail = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() !== ""
      ? value.trim().toLowerCase()
      : undefined,
  z.string().email("Use a valid email.").optional(),
);

const optionalPhone = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() !== ""
      ? value.replace(/\s+/g, "")
      : undefined,
  z.string().optional(),
);

export const rsvpInputSchema = z.object({
  slug: z.string().trim().min(1),
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: optionalEmail,
  phone: optionalPhone,
  status: z.enum(["GOING", "MAYBE", "NOT_GOING"]),
  plusOne: z.preprocess((value) => value === "on" || value === "true", z.boolean()),
  note: optionalText.pipe(z.string().max(500, "Keep the note under 500 characters.").optional()),
});

export type RsvpInput = z.infer<typeof rsvpInputSchema>;

export type RsvpActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialRsvpActionState: RsvpActionState = {
  status: "idle",
  message: "",
};

export function parseRsvpFormData(formData: FormData) {
  return rsvpInputSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    status: formData.get("status"),
    plusOne: formData.get("plusOne"),
    note: formData.get("note"),
  });
}

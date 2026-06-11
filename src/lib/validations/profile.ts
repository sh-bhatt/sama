import { z } from "zod";
import {
  isValidUsername,
  normalizeInstagram,
  normalizeOptionalUrl,
  normalizeUsername,
} from "@/lib/profile";

export const maxProfileImageSize = 3 * 1024 * 1024;
export const allowedProfileImageTypes = ["image/jpeg", "image/png", "image/webp"] as const;

const optionalText = (max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() ? value.trim() : undefined),
    z.string().max(max).optional(),
  );

export const profileInputSchema = z.object({
  name: optionalText(80),
  username: z.preprocess(
    normalizeUsername,
    z
      .string()
      .min(3, "Username must be at least 3 characters.")
      .max(32, "Username must be 32 characters or less.")
      .refine(isValidUsername, "Use lowercase letters, numbers, hyphens, or underscores.")
      .optional(),
  ),
  bio: optionalText(240),
  location: optionalText(80),
  instagramUrl: z.preprocess(
    normalizeInstagram,
    z.string().url("Enter a valid Instagram URL or handle.").optional(),
  ),
  websiteUrl: z.preprocess(
    normalizeOptionalUrl,
    z.string().url("Enter a valid website URL.").optional(),
  ),
  publicProfile: z.preprocess((value) => value === "on" || value === "true", z.boolean()),
});

export type ProfileInput = z.infer<typeof profileInputSchema>;

export function parseProfileFormData(formData: FormData) {
  return profileInputSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    bio: formData.get("bio"),
    location: formData.get("location"),
    instagramUrl: formData.get("instagramUrl"),
    websiteUrl: formData.get("websiteUrl"),
    publicProfile: formData.get("publicProfile"),
  });
}

export function validateProfileImage(file: File | null) {
  if (!file || file.size === 0) {
    return null;
  }

  if (!allowedProfileImageTypes.includes(file.type as (typeof allowedProfileImageTypes)[number])) {
    return "Upload a JPG, PNG, or WebP profile photo.";
  }

  if (file.size > maxProfileImageSize) {
    return "Keep profile photos under 3MB.";
  }

  return null;
}

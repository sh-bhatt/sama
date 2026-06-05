import { z } from "zod";

export const maxMemoryImageSize = 5 * 1024 * 1024;
export const allowedMemoryImageTypes = ["image/jpeg", "image/png", "image/webp"] as const;

export type MemoryUploadActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialMemoryUploadActionState: MemoryUploadActionState = {
  status: "idle",
  message: "",
};

const memoryUploadSchema = z.object({
  slug: z.string().trim().min(1, "Invite link is missing."),
  caption: z.string().trim().max(160, "Keep captions under 160 characters.").optional(),
  uploaderName: z.string().trim().max(60, "Keep names under 60 characters.").optional(),
});

export function parseMemoryUploadFormData(formData: FormData) {
  return memoryUploadSchema.safeParse({
    slug: formData.get("slug"),
    caption: String(formData.get("caption") || "") || undefined,
    uploaderName: String(formData.get("uploaderName") || "") || undefined,
  });
}

export function validateMemoryImage(file: File | null) {
  if (!file || file.size === 0) {
    return "Choose a photo to upload.";
  }

  if (!allowedMemoryImageTypes.includes(file.type as (typeof allowedMemoryImageTypes)[number])) {
    return "Upload a JPG, PNG, or WebP image.";
  }

  if (file.size > maxMemoryImageSize) {
    return "Keep each memory under 5MB for now.";
  }

  return null;
}

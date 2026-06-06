import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
export { isCloudinaryConfigured } from "@/lib/env";
import { isCloudinaryConfigured } from "@/lib/env";

function configureCloudinary() {
  if (!isCloudinaryConfigured()) {
    return false;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  return true;
}

export async function uploadMemoryImage({
  buffer,
  eventId,
}: {
  buffer: Buffer;
  eventId: string;
}) {
  if (!configureCloudinary()) {
    throw new Error("Cloudinary is not configured yet.");
  }

  return new Promise<Pick<UploadApiResponse, "secure_url" | "public_id">>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `sama/events/${eventId}/memories`,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary upload failed."));
          return;
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      },
    );

    stream.end(buffer);
  });
}

export async function deleteMemoryImage(publicId: string | null | undefined) {
  if (!publicId || !configureCloudinary()) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (error) {
    console.warn("Cloudinary memory delete skipped:", error);
  }
}

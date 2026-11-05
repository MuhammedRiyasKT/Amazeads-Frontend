import { uploadImage } from "@/services/image.service";

/**
 * Upload image file.
 * Automatically delegates to self-hosted server image management (/api/v1/shared/image-management)
 * with fallback to Cloudinary if configured, preserving the expected return shape ({ secure_url, url }).
 */
export async function uploadToCloudinary(file: File) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // If Cloudinary credentials are configured, try Cloudinary first
  if (cloudName && uploadPreset) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn("Cloudinary upload failed, falling back to server image-management:", err);
    }
  }

  // Use self-hosted ERP backend image management
  const result = await uploadImage(file, { folder: "images" });
  return {
    url: result.image_url,
    secure_url: result.image_url,
    ...result,
  };
}
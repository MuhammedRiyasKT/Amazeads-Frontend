import api from "@/lib/axios";
import {
  ImageUploadResponse,
  DeleteImageResponse,
  DeleteImagesByDateRangeResponse,
  DateRangeDeleteParams,
  UploadImageOptions,
  DeleteImageOptions,
} from "@/types/imageManagement";

const BASE_PATH = "/shared/image-management";

function unwrapResponse<T>(response: any): T {
  const data = response?.data;
  if (data && typeof data === "object") {
    // If backend response is wrapped in { status: ..., message: ..., data: { ... } }
    if ("data" in data && data.data && typeof data.data === "object") {
      return data.data as T;
    }
    return data as T;
  }
  return response as T;
}

export function resolveFullImageUrl(item: any): string {
  if (!item) return "";
  let url =
    typeof item === "string"
      ? item
      : item.image_url || item.url || item.secure_url || item.relative_url || "";
  if (!url || typeof url !== "string") return "";

  // 1. Get backend host origin from NEXT_PUBLIC_API_URL
  // e.g. "https://amaze-erp-backend-main-21hn.onrender.com/api/v1" -> "https://amaze-erp-backend-main-21hn.onrender.com"
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  let backendOrigin = "";
  try {
    if (apiUrl.startsWith("http://") || apiUrl.startsWith("https://")) {
      const parsedApi = new URL(apiUrl);
      backendOrigin = parsedApi.origin;
    }
  } catch {}

  // 2. If the backend returned localhost/127.0.0.1, swap it with the live backend server origin
  if (backendOrigin && (url.includes("localhost") || url.includes("127.0.0.1"))) {
    try {
      const parsed = new URL(url);
      url = `${backendOrigin}${parsed.pathname}${parsed.search}`;
    } catch {
      url = url.replace(/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, backendOrigin);
    }
  } else if (backendOrigin && !url.startsWith("http://") && !url.startsWith("https://")) {
    // 3. If it's a relative URL (e.g. "/uploads/images/...")
    url = `${backendOrigin}${url.startsWith("/") ? "" : "/"}${url}`;
  }

  return url;
}

/**
 * Upload an image to the designated folder.
 * Endpoint: POST /api/v1/shared/image-management
 */
export async function uploadImage(
  file: File,
  options?: UploadImageOptions
): Promise<ImageUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  if (options?.folder) {
    formData.append("folder", options.folder);
  }

  const response = await api.post(BASE_PATH, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (options?.onUploadProgress && progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        options.onUploadProgress(percentCompleted);
      }
    },
  });

  const unwrapped: any = unwrapResponse<any>(response);
  const fullUrl = resolveFullImageUrl(unwrapped);

  return {
    ...unwrapped,
    image_url: fullUrl,
    file_size: unwrapped?.file_size ?? unwrapped?.size ?? file.size ?? 0,
    content_type: unwrapped?.content_type ?? file.type ?? "",
  };
}

/**
 * Replace an existing image with a new uploaded image.
 * Endpoint: PUT /api/v1/shared/image-management/{filename}
 */
export async function replaceImage(
  filename: string,
  file: File,
  options?: UploadImageOptions
): Promise<ImageUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  if (options?.folder) {
    formData.append("folder", options.folder);
  }

  const encodedFilename = encodeURIComponent(filename);
  const response = await api.put(
    `${BASE_PATH}/${encodedFilename}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (options?.onUploadProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          options.onUploadProgress(percentCompleted);
        }
      },
    }
  );

  const unwrapped: any = unwrapResponse<any>(response);
  const fullUrl = resolveFullImageUrl(unwrapped);

  return {
    ...unwrapped,
    image_url: fullUrl,
    file_size: unwrapped?.file_size ?? unwrapped?.size ?? file.size ?? 0,
    content_type: unwrapped?.content_type ?? file.type ?? "",
  };
}

/**
 * Delete an individual image from the designated folder.
 * Endpoint: DELETE /api/v1/shared/image-management/{filename}
 */
export async function deleteImage(
  filename: string,
  options?: DeleteImageOptions
): Promise<DeleteImageResponse> {
  const encodedFilename = encodeURIComponent(filename);
  const response = await api.delete(
    `${BASE_PATH}/${encodedFilename}`,
    {
      params: options?.folder ? { folder: options.folder } : undefined,
    }
  );

  return unwrapResponse<DeleteImageResponse>(response);
}

/**
 * Delete all images saved between from_date and to_date strictly from the 'images' folder.
 * Endpoint: DELETE /api/v1/shared/image-management/by-date-range
 */
export async function deleteImagesByDateRange(
  params: DateRangeDeleteParams
): Promise<DeleteImagesByDateRangeResponse> {
  const response = await api.delete(
    `${BASE_PATH}/by-date-range`,
    {
      params: {
        from_date: params.from_date,
        to_date: params.to_date,
      },
    }
  );

  return unwrapResponse<DeleteImagesByDateRangeResponse>(response);
}

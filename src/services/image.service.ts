import api from "@/lib/axios";
import {
  ImageUploadResponse,
  DeleteImageResponse,
  DeleteImagesByDateRangeResponse,
  DateRangeDeleteParams,
  UploadImageOptions,
  DeleteImageOptions,
} from "@/types/imageManagement";

const BASE_PATH = "/api/v1/shared/image-management";

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

  const response = await api.post<ImageUploadResponse>(BASE_PATH, formData, {
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

  return response.data;
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
  const response = await api.put<ImageUploadResponse>(
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

  return response.data;
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
  const response = await api.delete<DeleteImageResponse>(
    `${BASE_PATH}/${encodedFilename}`,
    {
      params: options?.folder ? { folder: options.folder } : undefined,
    }
  );

  return response.data;
}

/**
 * Delete all images saved between from_date and to_date strictly from the 'images' folder.
 * Endpoint: DELETE /api/v1/shared/image-management/by-date-range
 */
export async function deleteImagesByDateRange(
  params: DateRangeDeleteParams
): Promise<DeleteImagesByDateRangeResponse> {
  const response = await api.delete<DeleteImagesByDateRangeResponse>(
    `${BASE_PATH}/by-date-range`,
    {
      params: {
        from_date: params.from_date,
        to_date: params.to_date,
      },
    }
  );

  return response.data;
}

"use client";

import { useState, useCallback } from "react";
import {
  uploadImage as uploadImageService,
  replaceImage as replaceImageService,
  deleteImage as deleteImageService,
} from "@/services/image.service";
import {
  ImageUploadResponse,
  DeleteImageResponse,
  UploadImageOptions,
  DeleteImageOptions,
} from "@/types/imageManagement";

function extractErrorMessage(err: any): string {
  const detail = err?.response?.data?.detail;
  const message = err?.response?.data?.message;

  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((d: any) => (typeof d === "string" ? d : d?.msg || JSON.stringify(d)))
      .join(", ");
  }
  if (detail && typeof detail === "object" && detail.msg) {
    return String(detail.msg);
  }
  if (typeof message === "string") return message;
  if (err?.message) return err.message;
  return "An unexpected error occurred during image operation";
}

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedData, setUploadedData] = useState<ImageUploadResponse | null>(null);

  const reset = useCallback(() => {
    setIsUploading(false);
    setIsDeleting(false);
    setProgress(0);
    setError(null);
    setUploadedData(null);
  }, []);

  const upload = useCallback(
    async (file: File, options?: UploadImageOptions): Promise<ImageUploadResponse> => {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      try {
        const result = await uploadImageService(file, {
          ...options,
          onUploadProgress: (pct) => {
            setProgress(pct);
            options?.onUploadProgress?.(pct);
          },
        });
        setUploadedData(result);
        return result;
      } catch (err: any) {
        const errorMsg = extractErrorMessage(err);
        setError(errorMsg);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const replace = useCallback(
    async (
      filename: string,
      file: File,
      options?: UploadImageOptions
    ): Promise<ImageUploadResponse> => {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      try {
        const result = await replaceImageService(filename, file, {
          ...options,
          onUploadProgress: (pct) => {
            setProgress(pct);
            options?.onUploadProgress?.(pct);
          },
        });
        setUploadedData(result);
        return result;
      } catch (err: any) {
        const errorMsg = extractErrorMessage(err);
        setError(errorMsg);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const remove = useCallback(
    async (
      filename: string,
      options?: DeleteImageOptions
    ): Promise<DeleteImageResponse> => {
      setIsDeleting(true);
      setError(null);

      try {
        const result = await deleteImageService(filename, options);
        if (uploadedData?.filename === filename) {
          setUploadedData(null);
        }
        return result;
      } catch (err: any) {
        const errorMsg = extractErrorMessage(err);
        setError(errorMsg);
        throw err;
      } finally {
        setIsDeleting(false);
      }
    },
    [uploadedData]
  );

  return {
    isUploading,
    isDeleting,
    progress,
    error,
    uploadedData,
    upload,
    replace,
    remove,
    reset,
    setError,
  };
}

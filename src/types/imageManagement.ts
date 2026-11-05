export type ImageFolder = "images" | "image_codes" | string;

export interface ImageUploadResponse {
  image_url: string;
  relative_url: string;
  folder: string;
  filename: string;
  original_filename: string;
  file_size: number;
  content_type: string;
}

export interface DeleteImageResponse {
  filename: string;
  folder: string;
  message: string;
}

export interface DeletedFileInfo {
  filename: string;
  folder: string;
  file_date: string;
}

export interface DeleteImagesByDateRangeResponse {
  deleted_count: number;
  from_date: string;
  to_date: string;
  folder: string;
  deleted_files: DeletedFileInfo[];
}

export interface UploadImageOptions {
  folder?: ImageFolder;
  onUploadProgress?: (progress: number) => void;
}

export interface DeleteImageOptions {
  folder?: ImageFolder;
}

export interface DateRangeDeleteParams {
  from_date: string; // Format: YYYY-MM-DD
  to_date: string;   // Format: YYYY-MM-DD
}

export interface ImageCategory {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ImageCodeProductCategory {
  id: number;
  category_name?: string;
  name?: string;
}

export interface ImageCode {
  id: number;
  image_code: string;
  image_name: string;
  description?: string;
  category_id: number;
  category_name?: string;
  image_url: string;
  is_active: boolean;
  delete_status?: boolean;
  created_at: string;
  updated_at: string;
  product_category_ids?: number[];
  product_categories?: ImageCodeProductCategory[];
}

export interface ImageCodePagination {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
}

export interface ImageCodeListResponse {
  items: ImageCode[];
  pagination: ImageCodePagination;
}

export interface CreateImageCodePayload {
  image_code: string;
  image_name: string;
  description?: string;
  category_id: number;
  image_url: string;
  is_active: boolean;
  product_category_ids: number[];
}

export interface UpdateImageCodePayload {
  image_code: string;
  image_name: string;
  description?: string;
  category_id: number;
  image_url: string;
  is_active: boolean;
  product_category_ids: number[];
}

export interface ValidateImageCodeData {
  is_available: boolean;
  exists: boolean;
  image_code: string;
}

export interface ValidateImageCodeResponse {
  success: boolean;
  message: string;
  data: ValidateImageCodeData;
}

export interface ImageCodeFilterParams {
  page?: number;
  page_size?: number;
  category_id?: number | "";
  search?: string;
  is_active?: boolean;
}

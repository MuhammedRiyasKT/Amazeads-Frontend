import axiosInstance from "@/lib/axios";
import {
  ImageCategory,
  ImageCode,
  ImageCodeListResponse,
  CreateImageCodePayload,
  UpdateImageCodePayload,
  ValidateImageCodeData,
  ImageCodeFilterParams,
} from "../types/imageCode";

// ==========================================
// IMAGE CATEGORY SERVICES
// ==========================================

export async function getImageCategories(params?: {
  is_active?: boolean;
  search?: string;
}): Promise<ImageCategory[]> {
  const queryParams: Record<string, any> = {};
  if (params?.is_active !== undefined) queryParams.is_active = params.is_active;
  if (params?.search && params.search.trim()) queryParams.search = params.search.trim();

  const response = await axiosInstance.get("/admin/image-codes/categories", {
    params: queryParams,
  });
  return response.data?.data || [];
}

export async function createImageCategory(payload: {
  name: string;
  description?: string;
  is_active: boolean;
}): Promise<ImageCategory> {
  const response = await axiosInstance.post("/admin/image-codes/categories", payload);
  return response.data?.data;
}

export async function getImageCategoryById(id: number): Promise<ImageCategory> {
  const response = await axiosInstance.get(`/admin/image-codes/categories/${id}`);
  return response.data?.data;
}

export async function updateImageCategory(
  id: number,
  payload: { name: string; description?: string; is_active: boolean }
): Promise<ImageCategory> {
  const response = await axiosInstance.put(`/admin/image-codes/categories/${id}`, payload);
  return response.data?.data;
}

export async function deleteImageCategory(id: number): Promise<any> {
  const response = await axiosInstance.delete(`/admin/image-codes/categories/${id}`);
  return response.data?.data;
}

// ==========================================
// IMAGE CODE SERVICES
// ==========================================

export async function validateImageCode(code: string): Promise<ValidateImageCodeData> {
  const response = await axiosInstance.get("/admin/image-codes/validate-code", {
    params: { image_code: code },
  });
  return response.data?.data;
}

export async function createImageCode(
  payload: CreateImageCodePayload
): Promise<ImageCode> {
  const response = await axiosInstance.post("/admin/image-codes", payload);
  return response.data?.data;
}

export async function getImageCodes(
  params: ImageCodeFilterParams = {}
): Promise<ImageCodeListResponse> {
  const queryParams: Record<string, any> = {
    page: params.page || 1,
    page_size: params.page_size || 5,
  };

  if (params.category_id !== undefined && params.category_id !== "") {
    queryParams.category_id = params.category_id;
  }
  if (params.search && params.search.trim()) {
    queryParams.search = params.search.trim();
  }
  if (params.is_active !== undefined) {
    queryParams.is_active = params.is_active;
  }

  const response = await axiosInstance.get("/admin/image-codes", {
    params: queryParams,
  });
  return response.data?.data || { items: [], pagination: { page: 1, page_size: 5, total_count: 0, total_pages: 1 } };
}

export async function getImageCodeById(id: number): Promise<ImageCode> {
  const response = await axiosInstance.get(`/admin/image-codes/${id}`);
  return response.data?.data;
}

export async function updateImageCode(
  id: number,
  payload: UpdateImageCodePayload
): Promise<ImageCode> {
  const response = await axiosInstance.put(`/admin/image-codes/${id}`, payload);
  return response.data?.data;
}

export async function deleteImageCode(id: number): Promise<any> {
  const response = await axiosInstance.delete(`/admin/image-codes/${id}`);
  return response.data?.data;
}

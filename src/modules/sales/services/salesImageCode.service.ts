import axiosInstance from "@/lib/axios";
import {
  ImageCategory,
  ImageCode,
  ImageCodeListResponse,
} from "@/modules/products/types/imageCode";

export interface SalesImageCodeFilterParams {
  page?: number;
  page_size?: number;
  search?: string;
  category_name?: string;
  category_id?: number | string;
  is_active?: boolean;
}

/**
 * 1. സെയിൽസ് ഇമേജ് കാറ്റഗറികൾ ഫെച്ച് ചെയ്യുന്നു
 * URL: /sales/image-codes/categories?is_active=true
 */
export async function getSalesImageCategories(params?: {
  is_active?: boolean;
  search?: string;
}): Promise<ImageCategory[]> {
  const queryParams: Record<string, any> = {};
  if (params?.is_active !== undefined) {
    queryParams.is_active = params.is_active;
  }
  if (params?.search && params.search.trim()) {
    queryParams.search = params.search.trim();
  }

  const response = await axiosInstance.get("/sales/image-codes/categories", {
    params: queryParams,
  });
  return response.data?.data || [];
}

/**
 * 2. സെയിൽസ് ഇമേജ് കോഡുകൾ ഫെച്ച് ചെയ്യുന്നു
 * URL: /sales/image-codes?page=1&page_size=5&category_name=...&search=...
 */
export async function getSalesImageCodes(
  params: SalesImageCodeFilterParams = {}
): Promise<ImageCodeListResponse> {
  const queryParams: Record<string, any> = {
    page: params.page || 1,
    page_size: params.page_size || 10,
  };

  if (params.category_name && params.category_name.trim()) {
    queryParams.category_name = params.category_name.trim();
  }
  if (params.category_id !== undefined && params.category_id !== "") {
    queryParams.category_id = params.category_id;
  }
  if (params.search && params.search.trim()) {
    queryParams.search = params.search.trim();
  }
  if (params.is_active !== undefined) {
    queryParams.is_active = params.is_active;
  }

  const response = await axiosInstance.get("/sales/image-codes", {
    params: queryParams,
  });
  return (
    response.data?.data || {
      items: [],
      pagination: { page: 1, page_size: queryParams.page_size, total_count: 0, total_pages: 1 },
    }
  );
}

/**
 * 3. സിംഗിൾ ഇമേജ് കോഡ് വിവരങ്ങൾ ഫെച്ച് ചെയ്യുന്നു
 * URL: /sales/image-codes/:id
 */
export async function getSalesImageCodeById(id: number): Promise<ImageCode> {
  const response = await axiosInstance.get(`/sales/image-codes/${id}`);
  return response.data?.data;
}

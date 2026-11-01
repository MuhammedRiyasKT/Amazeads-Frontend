import axiosInstance from "@/lib/axios";
import { Product, ProductListResponse, CreateProductPayload } from "../types/product";

// categoryId ഡൈനാമിക് പരാമീറ്റർ ആയി ഇവിടെ ചേർത്തു
export async function getProducts(
  page: number = 1, 
  pageSize: number = 5, 
  categoryId?: number,
  search?: string
): Promise<ProductListResponse> {
  const params: any = { page, page_size: pageSize };
  if (categoryId) {
    params.category_id = categoryId;
  }
  if (search && search.trim()) {
    params.search = search.trim();
  }
  
  const response = await axiosInstance.get("/admin/products/", { params });
  return response.data.data;
}

export async function getProductById(id: number): Promise<Product> {
  const response = await axiosInstance.get(`/admin/products/${id}`);
  return response.data.data;
}

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  const response = await axiosInstance.post("/admin/products/", payload);
  return response.data.data;
}

export async function updateProduct(id: number, payload: CreateProductPayload): Promise<Product> {
  const response = await axiosInstance.put(`/admin/products/${id}`, payload);
  return response.data.data;
}

export async function deleteProduct(id: number): Promise<any> {
  const response = await axiosInstance.delete(`/admin/products/${id}`);
  return response.data.data;
}

export interface ValidateItemCodeResponse {
  is_available: boolean;
  message?: string;
  existingProduct?: Product | null;
}

/**
 * Checks if a product with the given item code already exists using
 * GET /admin/products/validate-item-code?item_code=...
 * Supports excluding the current product ID when in edit mode.
 */
export async function validateProductItemCode(
  itemCode: string,
  excludeProductId?: number
): Promise<ValidateItemCodeResponse> {
  const trimmed = itemCode.trim();
  if (!trimmed) {
    return { is_available: false, message: "Item code cannot be empty" };
  }

  try {
    const response = await axiosInstance.get("/admin/products/validate-item-code", {
      params: { item_code: trimmed },
    });

    const data = response.data?.data ?? response.data;

    // Check if the returned existing product is the one being edited
    const matchedId = data?.product_id || data?.id || data?.existing_product?.id;
    if (excludeProductId && matchedId && Number(matchedId) === Number(excludeProductId)) {
      return {
        is_available: true,
        message: `Item code "${trimmed}" belongs to this product`,
      };
    }

    const isAvailable =
      data?.is_available === true ||
      data?.available === true ||
      data?.exists === false ||
      data?.valid === true;

    const isTaken =
      data?.is_available === false ||
      data?.available === false ||
      data?.exists === true ||
      data?.valid === false;

    if (isTaken) {
      return {
        is_available: false,
        message: data?.message || data?.detail || `Item code "${trimmed}" already exists`,
      };
    }

    if (isAvailable) {
      return {
        is_available: true,
        message: data?.message || `Item code "${trimmed}" is available`,
      };
    }

    return {
      is_available: true,
      message: `Item code "${trimmed}" is available`,
    };
  } catch (err: any) {
    console.error("validate-item-code error:", err);
    const detail = err.response?.data?.detail;
    const message = err.response?.data?.message;
    let backendMsg = "";

    if (typeof detail === "string") {
      backendMsg = detail;
    } else if (Array.isArray(detail)) {
      backendMsg = detail.map((d: any) => d?.msg || String(d)).join(", ");
    } else if (detail && typeof detail === "object" && detail.msg) {
      backendMsg = detail.msg;
    } else if (typeof message === "string") {
      backendMsg = message;
    }

    if (
      backendMsg &&
      (backendMsg.toLowerCase().includes("exist") ||
        backendMsg.toLowerCase().includes("taken") ||
        backendMsg.toLowerCase().includes("already") ||
        backendMsg.toLowerCase().includes("duplicate") ||
        backendMsg.toLowerCase().includes("item code") ||
        backendMsg.toLowerCase().includes("code"))
    ) {
      return {
        is_available: false,
        message: backendMsg,
      };
    }

    // Fallback: search existing product by item code via getProducts (page_size: 1)
    try {
      const res = await getProducts(1, 1, undefined, trimmed);
      const items = res?.items || [];
      const normalized = trimmed.toLowerCase();

      const existing = items.find((p) => {
        if (excludeProductId && Number(p.id) === Number(excludeProductId)) {
          return false;
        }
        return (p.item_code || "").trim().toLowerCase() === normalized;
      });

      if (existing) {
        return {
          is_available: false,
          message: `Item code "${trimmed}" already exists`,
          existingProduct: existing,
        };
      }

      return {
        is_available: true,
        message: `Item code "${trimmed}" is available`,
      };
    } catch {
      return {
        is_available: true,
        message: "Could not verify code availability",
      };
    }
  }
}
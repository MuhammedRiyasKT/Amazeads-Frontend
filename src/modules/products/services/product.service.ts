import axiosInstance from "@/lib/axios";
import { Product, ProductListResponse, CreateProductPayload } from "../types/product";

// categoryId ഡൈനാമിക് പരാമീറ്റർ ആയി ഇവിടെ ചേർത്തു
export async function getProducts(
  page: number = 1, 
  pageSize: number = 5, 
  categoryId?: number
): Promise<ProductListResponse> {
  const params: any = { page, page_size: pageSize };
  if (categoryId) {
    params.category_id = categoryId;
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
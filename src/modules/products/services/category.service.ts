import axiosInstance from "@/lib/axios";
import { Category, PriceCategory } from "../types/category";

export async function getCategories(): Promise<Category[]> {
  const response = await axiosInstance.get("/admin/products/categories");
  return response.data.data;
}

export async function createCategory(payload: { category_name: string; status: boolean }): Promise<Category> {
  const response = await axiosInstance.post("/admin/products/categories", payload);
  return response.data.data;
}

export async function updateCategory(id: number, payload: { category_name: string; status: boolean }): Promise<Category> {
  const response = await axiosInstance.put(`/admin/products/categories/${id}`, payload);
  return response.data.data;
}

export async function deleteCategory(id: number): Promise<any> {
  const response = await axiosInstance.delete(`/admin/products/categories/${id}`);
  return response.data.data;
}

export async function getPriceCategories(): Promise<PriceCategory[]> {
  const response = await axiosInstance.get("/admin/products/price-categories");
  return response.data.data;
}

export async function createPriceCategory(payload: { price_category_name: string; status: boolean }): Promise<PriceCategory> {
  const response = await axiosInstance.post("/admin/products/price-categories", payload);
  return response.data.data;
}

export async function updatePriceCategory(id: number, payload: { price_category_name: string; status: boolean }): Promise<PriceCategory> {
  const response = await axiosInstance.put(`/admin/products/price-categories/${id}`, payload);
  return response.data.data;
}

export async function deletePriceCategory(id: number): Promise<any> {
  const response = await axiosInstance.delete(`/admin/products/price-categories/${id}`);
  return response.data.data;
}
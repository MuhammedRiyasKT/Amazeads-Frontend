import axiosInstance from "@/lib/axios";
import { Category } from "@/modules/products/types/category";

// 1. സെയിൽസ് കാറ്റഗറികൾ ഫെച്ച് ചെയ്യുന്നു
// URL: [BASE_URL]/sales/products/categories
export async function getSalesCategories(): Promise<Category[]> {
  const response = await axiosInstance.get("/sales/products/categories");
  return response.data.data;
}
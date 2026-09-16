"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCategories } from "../hooks/useCategories";
import { usePriceCategories } from "../hooks/usePriceCategories";
import { createProduct } from "../services/product.service";
import { CreateProductPayload } from "../types/product";
import ProductForm from "../components/ProductForm";

export default function ProductCreatePage() {
  const router = useRouter();
  const { categories } = useCategories();
  const { priceCategories } = usePriceCategories();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (payload: CreateProductPayload) => {
    setIsSubmitting(true);
    try {
      const selectedCategoryIds = payload.category_ids && payload.category_ids.length > 0
        ? payload.category_ids
        : payload.category_id ? [payload.category_id] : [];

      if (selectedCategoryIds.length === 0) {
        alert("Please select at least one category.");
        return;
      }

      await Promise.all(
        selectedCategoryIds.map((catId) => {
          const { category_ids, ...restPayload } = payload;
          return createProduct({
            ...restPayload,
            category_id: catId,
          });
        })
      );

      alert(
        selectedCategoryIds.length > 1
          ? `Product created successfully across ${selectedCategoryIds.length} categories!`
          : "Product created successfully!"
      );
      router.push("/admin/products");
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.response?.data?.message || err?.response?.data?.detail || "Failed to create product";
      alert(`Error: ${errMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 border-b pb-5">
        <Link href="/admin/products" passHref legacyBehavior>
          <button className="p-2 border rounded-lg hover:bg-slate-50 cursor-pointer transition-all">
            <ArrowLeft size={16} className="text-slate-600" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">New Product Management</h1>
          <p className="text-sm text-slate-500 mt-1">Configure multi-step details and segment level cost metrics.</p>
        </div>
      </div>
      <ProductForm 
        categories={categories} 
        priceCategories={priceCategories} 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting} 
      />
    </div>
  );
}
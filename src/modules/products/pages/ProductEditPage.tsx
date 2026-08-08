"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCategories } from "../hooks/useCategories";
import { usePriceCategories } from "../hooks/usePriceCategories";
import { getProductById, updateProduct } from "../services/product.service";
import { CreateProductPayload, Product } from "../types/product";
import ProductForm from "../components/ProductForm";

export default function ProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);

  const { categories } = useCategories();
  const { priceCategories } = usePriceCategories();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getProductById(id)
        .then((data) => setProduct(data))
        .catch((err) => console.error("Error fetching product for edit:", err))
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const handleSubmit = async (payload: CreateProductPayload) => {
    setIsSubmitting(true);
    try {
      // 🌟 PUT /api/v1/admin/products/{id} എപിഐയിലേക്ക് പുതിയ Payload അയക്കുന്നു
      await updateProduct(id, payload);
      alert("Product configuration updated successfully!");
      router.push("/admin/products");
    } catch (err: any) {
      console.error("Failed to update product:", err);
      const errMsg = err?.response?.data?.message || err?.response?.data?.detail || "Failed to update product configuration";
      alert(`Error: ${errMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 font-semibold flex flex-col items-center justify-center gap-2">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading product configuration...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 border-b pb-5">
        <Link href="/admin/products" passHref legacyBehavior>
          <button className="p-2 border rounded-lg hover:bg-slate-50 cursor-pointer transition-all">
            <ArrowLeft size={16} className="text-slate-600" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Edit Product Configuration</h1>
          <p className="text-sm text-slate-500 mt-1">Adjust pricing categories, rates and additional charges.</p>
        </div>
      </div>

      {product && (
        <ProductForm 
          initialData={product} 
          categories={categories} 
          priceCategories={priceCategories} 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting} 
        />
      )}
    </div>
  );
}
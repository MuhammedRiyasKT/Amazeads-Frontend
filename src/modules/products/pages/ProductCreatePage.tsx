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
      await createProduct(payload);
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      alert("Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 border-b pb-5">
        <Link href="/admin/products" passHref legacyBehavior>
          <button className="p-2 border rounded-lg hover:bg-slate-50 cursor-pointer"><ArrowLeft size={16} /></button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">New Product Entry</h1>
          <p className="text-sm text-slate-500 mt-1">Populate variables and cost parameters for real-time simulation.</p>
        </div>
      </div>
      <ProductForm categories={categories} priceCategories={priceCategories} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
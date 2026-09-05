"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useSalesStore } from "@/store/salesStore";
import { useAuthStore } from "@/store/authStore";
import { Category } from "@/modules/products/types/category";
import { getSalesCategories } from "../services/salesCategory.service";

interface SalesCategorySelectPageProps {
  onCategorySelected: () => void;
}

export default function SalesCategorySelectPage({ onCategorySelected }: SalesCategorySelectPageProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const setSelectedCategory = useSalesStore((state) => state.setSelectedCategory);
  const logout = useAuthStore((state) => state.logout);

  // സർവീസ് വഴി കാറ്റഗറികൾ ലോഡ് ചെയ്യുന്നു
  useEffect(() => {
    setIsLoading(true);
    getSalesCategories()
      .then((data) => {
        setCategories(data || []);
      })
      .catch((err) => console.error("Error loading sales categories:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSelect = (category: Category) => {
    // Zustand സ്റ്റോറിലേക്ക് സെലക്ട് ചെയ്ത ഡാറ്റ സൂക്ഷിക്കുന്നു
    setSelectedCategory({
      id: category.id,
      category_name: category.category_name,
    });
    onCategorySelected(); // പാനൽ അപ്ഡേറ്റ് ചെയ്യുന്നു
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      try {
        if (typeof logout === "function") {
          await logout();
        } else {
          sessionStorage.clear();
        }
      } catch (err) {
        console.error("Logout error:", err);
      } finally {
        router.push("/login");
      }
    }
  };

  const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="fixed inset-0 bg-[#ffffff] flex items-center justify-center z-[5000] p-4">
      {/* Top Right Logout Button */}
      <div className="absolute top-6 right-6 sm:top-8 sm:right-8">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-xs rounded-xl border border-rose-200 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
          title="Logout"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-center text-slate-500 font-semibold">
          <div className="w-6 h-6 border-2 border-[#2d2d2d] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Loading Categories...
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-6 max-w-4xl">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleSelect(cat)}
              className="w-64 py-5 bg-[#2d2d2d] hover:bg-[#1f2328] text-white text-base font-bold rounded-xl shadow-lg border border-transparent hover:scale-102 transition-all cursor-pointer tracking-wide"
            >
              {capitalizeWords(cat.category_name)}
            </button>
          ))}
          {categories.length === 0 && (
            <div className="text-slate-400 font-semibold">No active categories found in the system.</div>
          )}
        </div>
      )}
    </div>
  );
}
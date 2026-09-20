"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Sparkles, Layers, ArrowRight, Package, Palette, ShoppingBag, ShieldCheck } from "lucide-react";
import { useProjectManagerStore } from "@/store/projectManagerStore";
import { useAuthStore } from "@/store/authStore";
import { Category } from "@/modules/products/types/category";
import { getSalesCategories } from "@/modules/sales/services/salesCategory.service";

interface OrderCategorySelectPageProps {
  onCategorySelected: () => void;
}

export function OrderCategorySelectPage({ onCategorySelected }: OrderCategorySelectPageProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const setSelectedCategory = useProjectManagerStore((state) => state.setSelectedCategory);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    setIsLoading(true);
    getSalesCategories()
      .then((data) => {
        setCategories(data || []);
      })
      .catch((err) => console.error("Error loading categories:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSelect = (category: Category) => {
    setSelectedCategory({
      id: category.id,
      category_name: category.category_name,
    });
    onCategorySelected();
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

  // Helper to get category-specific icon
  const getCategoryIcon = (categoryName: string) => {
    const nameLower = categoryName.toLowerCase();
    if (nameLower.includes("crystal") || nameLower.includes("art")) {
      return <Palette className="w-6 h-6 text-amber-600" />;
    }
    if (nameLower.includes("ad") || nameLower.includes("amaze")) {
      return <Sparkles className="w-6 h-6 text-indigo-600" />;
    }
    if (nameLower.includes("sign") || nameLower.includes("print")) {
      return <Package className="w-6 h-6 text-emerald-600" />;
    }
    return <ShoppingBag className="w-6 h-6 text-cyan-600" />;
  };

  return (
    <div className="fixed inset-0 bg-white flex flex-col justify-between z-[5000] p-4 sm:p-8 overflow-y-auto">
      {/* TOP NAVBAR */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-5xl mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-2.5 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles size={16} />
          </div>
          <span className="font-black text-sm tracking-wider text-slate-900">
            AMAZE <span className="text-indigo-600">ERP</span>
          </span>
        </div>

        {/* Logout Button */}
        <div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-xs rounded-xl border border-rose-200 transition-all cursor-pointer shadow-2xs active:scale-95"
            title="Logout"
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* CENTER HERO CONTENT */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto py-8 max-w-3xl mx-auto w-full text-center">
        {/* Category Selection Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-extrabold mb-4">
          <Layers size={14} />
          <span>Department Workspace</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
          Select Category
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto mb-8 leading-relaxed font-medium">
          Choose a business category to open tailored order overview, production, and analytics.
        </p>

        {/* CATEGORY CARDS / LOADING STATE */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="h-32 bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between animate-pulse"
              >
                <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                <div className="h-5 bg-slate-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 max-w-md w-full text-slate-500 text-sm font-semibold">
            No active categories found in the system.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 w-full max-w-xl">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSelect(cat)}
                className="group relative bg-white hover:bg-slate-50/80 border-2 border-slate-200/90 hover:border-indigo-600 shadow-2xs hover:shadow-md rounded-2xl p-5 text-left transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[140px]"
              >
                {/* Top Row: Icon & Arrow Indicator */}
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="p-2.5 rounded-xl bg-slate-100/80 border border-slate-200/60 group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-colors">
                    {getCategoryIcon(cat.category_name)}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-indigo-600 text-slate-400 group-hover:text-white flex items-center justify-center transition-colors">
                    <ArrowRight size={16} className="transform group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                {/* Bottom Row: Category Name */}
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors tracking-wide">
                    {capitalizeWords(cat.category_name)}
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-400 group-hover:text-slate-600 transition-colors">
                    Click to open workspace &rarr;
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="relative z-10 text-center text-xs text-slate-400 font-semibold py-2">
        Amaze ERP &copy; {new Date().getFullYear()} &bull; All Rights Reserved
      </div>
    </div>
  );
}

export default OrderCategorySelectPage;

"use client";

import React, { useState } from "react";
import { useSalesStore } from "@/store/salesStore"; // Zustand Store
import { SalesPage } from "@/modules/sales"; // നിങ്ങളുടെ ഒറിജിനൽ ഒവർവ്യൂ പേജ്
import SalesCategorySelectPage from "@/modules/sales/pages/SalesCategorySelectPage"; // സെലക്ഷൻ പേജ്

export default function Page() {
  const { selectedCategory, _hasHydrated } = useSalesStore();   
  const [refreshKey, setRefreshKey] = useState(0);

  // കാറ്റഗറി തിരഞ്ഞെടുത്തു കഴിഞ്ഞാൽ സ്റ്റേറ്റ് അപ്ഡേറ്റ് ചെയ്യാനുള്ള ഹെൽപ്പർ
  const handleCategorySelected = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Next.js Hydration പൂർത്തിയാകുന്നത് വരെ കാത്തിരിക്കുന്നു (Error തടയാൻ)
  if (!_hasHydrated) {
    return (
      <div className="p-12 text-center text-slate-500 font-semibold">
        Loading sales configuration...
      </div>
    );
  }

  // 1. കാറ്റഗറി ഇതുവരെ തിരഞ്ഞെടുത്തിട്ടില്ലെങ്കിൽ ആദ്യം സെലക്ഷൻ പേജ് കാണിക്കും
  if (!selectedCategory) {
    return <SalesCategorySelectPage onCategorySelected={handleCategorySelected} />;
  }

  // 2. തിരഞ്ഞെടുപ്പ് കഴിഞ്ഞാൽ നിങ്ങളുടെ ഒറിജിനൽ ഒവർവ്യൂ (Overview) പേജ് കാണിക്കും
  return <SalesPage key={refreshKey} />;
}
"use client";

import React, { useState } from "react";
import { useProjectManagerStore } from "@/store/projectManagerStore";
import { ProjectManagerOverviewPage, PMCategorySelectPage } from "@/modules/project-manager";

export default function Page() {
  const { selectedCategory, _hasHydrated } = useProjectManagerStore();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCategorySelected = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (!_hasHydrated) {
    return (
      <div className="p-12 text-center text-slate-500 font-semibold">
        Loading project manager configuration...
      </div>
    );
  }

  if (!selectedCategory) {
    return <PMCategorySelectPage onCategorySelected={handleCategorySelected} />;
  }

  return <ProjectManagerOverviewPage key={refreshKey} />;
}
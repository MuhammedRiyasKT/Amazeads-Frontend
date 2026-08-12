"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Cog } from "lucide-react";
import ProductionCardGrid from "../components/ProductionCardGrid";
import { useProductionStore } from "@/store/productionStore";

export type ProductionStatusFilterType = "Assigned" | "In Progress" | "Completed" | "Not Completed";

interface ProductionDashboardPageProps {
  categoryName: string;
}

export default function ProductionDashboardPage({ categoryName }: ProductionDashboardPageProps) {
  const selectedSubDept = useProductionStore((state) => state.selectedSubDept);
  const activeUnit = selectedSubDept?.sub_department_name || categoryName;

  // Status Filter state
  const [activeStatusFilter, setActiveStatusFilter] = useState<ProductionStatusFilterType>("Assigned");

  return (
    <div className="flex flex-col gap-4 sm:gap-5 p-3 sm:p-6 w-full max-w-full overflow-x-hidden box-border">
      {/* 🌟 HEADER ROW: Title on Left, Filter Tabs on Top Right */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4 border-b border-slate-200 pb-3.5 w-full">
        {/* Left Side: Category Badge & Title */}
        <div className="flex flex-col gap-1.5 sm:gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Link 
              href="/production" 
              className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer shadow-2xs"
            >
              <ArrowLeft size={13} /> Back to Categories
            </Link>

            <span className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-100 flex items-center gap-1">
              <Cog size={13} /> {activeUnit}
            </span>
          </div>

          <div>
            <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Daily Production Queue ({activeUnit})
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
              Manage upcoming and active production jobs assigned for {activeUnit}.
            </p>
          </div>
        </div>

        {/* 🌟 Right Side: Filter Tabs (Touch Scrollable for Mobile) */}
        <div className="w-full md:w-auto overflow-x-auto scrollbar-none py-1">
          <div className="flex items-center gap-1.5 min-w-max">
            {[
              { id: "Assigned", label: "Assigned" },
              { id: "In Progress", label: "In Progress" },
              { id: "Completed", label: "Completed" },
              { id: "Not Completed", label: "Not Completed" },
            ].map((tab) => {
              const isActive = activeStatusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveStatusFilter(tab.id as ProductionStatusFilterType)}
                  className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white border border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Production Task Grid & Table */}
      <ProductionCardGrid activeStatusFilter={activeStatusFilter} />
    </div>
  );
}
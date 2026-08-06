"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Cog } from "lucide-react";
import ProductionCardGrid from "../components/ProductionCardGrid";
import { useProductionStore } from "@/store/productionStore";

interface ProductionDashboardPageProps {
  categoryName: string;
}

export default function ProductionDashboardPage({ categoryName }: ProductionDashboardPageProps) {
  const selectedSubDept = useProductionStore((state) => state.selectedSubDept);
  const activeUnit = selectedSubDept?.sub_department_name || categoryName;

  return (
    <div className="flex flex-col gap-5 p-6">
      
      {/* Clean Page Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Link 
            href="/production" 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer shadow-2xs"
          >
            <ArrowLeft size={14} /> Back to Categories
          </Link>

          <span className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-100 flex items-center gap-1">
            <Cog size={13} /> {activeUnit}
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Daily Production Queue ({activeUnit})
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage upcoming and active production jobs assigned for {activeUnit}.
          </p>
        </div>
      </div>

      {/* Production Task Grid Table */}
      <ProductionCardGrid />
    </div>
  );
}
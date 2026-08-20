// src/modules/accounts/components/FinancialComparisonBar.tsx

import React from "react";
import { TrendingUp, Wallet, Clock3, BarChart3 } from "lucide-react";

const formatINR = (val: number | undefined | null) => {
  if (val === undefined || val === null) return "₹0";
  const formatted = Math.abs(val).toLocaleString("en-IN");
  return val < 0 ? `-₹${formatted}` : `₹${formatted}`;
};

interface Props {
  sales: number;
  collection: number;
  pending: number;
}

export const FinancialComparisonBar: React.FC<Props> = ({ sales, collection, pending }) => {
  // ഗ്രാഫിന്റെ ഉയരം കണക്കാക്കാൻ ഏറ്റവും വലിയ മൂല്യം കണ്ടെത്തുന്നു
  const maxVal = Math.max(sales, collection, pending, 1);

  // ബാറുകളുടെ ഉയരം (ശതമാനത്തിൽ)
  const salesHeight = sales > 0 ? Math.max(Math.round((sales / maxVal) * 100), 10) : 4;
  const collectionHeight = collection > 0 ? Math.max(Math.round((collection / maxVal) * 100), 10) : 4;
  const pendingHeight = pending > 0 ? Math.max(Math.round((pending / maxVal) * 100), 10) : 4;

  const realizationRate = sales > 0 ? Math.round((collection / sales) * 100) : 0;
  const pendingRate = sales > 0 ? Math.round((pending / sales) * 100) : 0;

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-4">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-800 tracking-tight">
            Financial Performance Graph
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            Realization: {realizationRate}%
          </span>
          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60">
            Pending: {pendingRate}%
          </span>
        </div>
      </div>

      {/* Vertical Chart Area */}
      <div className="relative pt-4 pb-2">
        {/* Background Horizontal Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
          <div className="border-b border-dashed border-slate-200 w-full h-0"></div>
          <div className="border-b border-dashed border-slate-200 w-full h-0"></div>
          <div className="border-b border-dashed border-slate-200 w-full h-0"></div>
          <div className="border-b border-slate-200 w-full h-0"></div>
        </div>

        {/* Vertical Bars Columns */}
        <div className="relative z-10 grid grid-cols-3 gap-3 md:gap-8 h-56 items-end px-2 md:px-12">
          
          {/* 1. SALES BAR */}
          <div className="flex flex-col items-center h-full justify-end group">
            <div className="mb-2 text-center transition-transform group-hover:-translate-y-1 duration-200">
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 shadow-xs">
                {formatINR(sales)}
              </span>
            </div>
            <div className="w-full max-w-[64px] bg-slate-100 rounded-t-xl overflow-hidden flex flex-col justify-end p-1 h-full max-h-[170px]">
              <div
                style={{ height: `${salesHeight}%` }}
                className="w-full bg-gradient-to-t from-indigo-600 to-indigo-500 rounded-t-lg transition-all duration-700 shadow-sm"
              />
            </div>
            <div className="mt-2.5 text-center">
              <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-800">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                Sales
              </div>
              <span className="text-[10px] font-medium text-slate-400">Total Billed</span>
            </div>
          </div>

          {/* 2. COLLECTION BAR */}
          <div className="flex flex-col items-center h-full justify-end group">
            <div className="mb-2 text-center transition-transform group-hover:-translate-y-1 duration-200">
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 shadow-xs">
                {formatINR(collection)}
              </span>
            </div>
            <div className="w-full max-w-[64px] bg-slate-100 rounded-t-xl overflow-hidden flex flex-col justify-end p-1 h-full max-h-[170px]">
              <div
                style={{ height: `${collectionHeight}%` }}
                className="w-full bg-gradient-to-t from-emerald-600 to-emerald-500 rounded-t-lg transition-all duration-700 shadow-sm"
              />
            </div>
            <div className="mt-2.5 text-center">
              <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-800">
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                Collection
              </div>
              <span className="text-[10px] font-medium text-slate-400">{realizationRate}% Realized</span>
            </div>
          </div>

          {/* 3. PENDING BAR */}
          <div className="flex flex-col items-center h-full justify-end group">
            <div className="mb-2 text-center transition-transform group-hover:-translate-y-1 duration-200">
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 shadow-xs">
                {formatINR(pending)}
              </span>
            </div>
            <div className="w-full max-w-[64px] bg-slate-100 rounded-t-xl overflow-hidden flex flex-col justify-end p-1 h-full max-h-[170px]">
              <div
                style={{ height: `${pendingHeight}%` }}
                className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-lg transition-all duration-700 shadow-sm"
              />
            </div>
            <div className="mt-2.5 text-center">
              <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-800">
                <Clock3 className="w-3.5 h-3.5 text-amber-600" />
                Pending
              </div>
              <span className="text-[10px] font-medium text-slate-400">{pendingRate}% Outstanding</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
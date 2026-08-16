// src/modules/sales/components/OrderFilters.tsx

"use client";

import React from "react";

interface OrderFiltersProps {
  mobileSearch: string;
  setMobileSearch: (val: string) => void;
  orderStatus: string;
  setOrderStatus: (val: string) => void;
  onClear?: () => void;
}

export default function OrderFilters({
  mobileSearch,
  setMobileSearch,
  orderStatus,
  setOrderStatus,
}: OrderFiltersProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Search Input */}
      <div className="flex-1 max-w-sm">
        <input
          type="text"
          placeholder="Search Mobile No..."
          value={mobileSearch}
          onChange={(e) => setMobileSearch(e.target.value)}
          className="h-10 w-full border border-slate-200 rounded-lg px-4 text-xs font-semibold focus:outline-none focus:border-indigo-600 transition-colors"
        />
      </div>

      {/* Horizontal Status Filter Bar (Confirmed, In Progress) */}
      <div className="flex items-center gap-1 bg-slate-100/70 border p-1 rounded-xl shrink-0 self-start sm:self-center">
        <button
          type="button"
          onClick={() => setOrderStatus("")}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            orderStatus === ""
              ? "bg-white text-slate-800 shadow-xs border border-slate-100"
              : "text-slate-500 hover:text-slate-700 border border-transparent"
          }`}
        >
          All Orders
        </button>
        <button
          type="button"
          onClick={() => setOrderStatus("Confirmed")}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            orderStatus === "Confirmed"
              ? "bg-white text-indigo-700 shadow-xs border border-slate-100"
              : "text-slate-500 hover:text-indigo-600 border border-transparent"
          }`}
        >
          New Orders
        </button>
        <button
          type="button"
          onClick={() => setOrderStatus("In Progress")}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            orderStatus === "In Progress"
              ? "bg-white text-indigo-700 shadow-xs border border-slate-100"
              : "text-slate-500 hover:text-indigo-600 border border-transparent"
          }`}
        >
          In Progress
        </button>
      </div>
    </div>
  );
}
"use client";

import React from "react";

interface CostBreakdownProps {
  material: number;
  printing: number;
  ads: number;
  cutting: number;
  packing: number;
  other: number;
}

export default function CostBreakdown({ material, printing, ads, cutting, packing, other }: CostBreakdownProps) {
  const total = material + printing + ads + cutting + packing + other;

  const items = [
    { label: "Material", val: material, color: "bg-indigo-500" },
    { label: "Printing", val: printing, color: "bg-sky-500" },
    { label: "Ads", val: ads, color: "bg-amber-500" },
    { label: "Cutting", val: cutting, color: "bg-pink-500" },
    { label: "Packing", val: packing, color: "bg-teal-500" },
    { label: "Other", val: other, color: "bg-slate-500" }
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
      <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b pb-3 mb-4">Cost Ratio Breakdown</h3>
      <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-100 mb-5">
        {items.map((item, idx) => {
          if (total === 0 || item.val === 0) return null;
          const widthPct = (item.val / total) * 100;
          return <div key={idx} className={`${item.color} h-full`} style={{ width: `${widthPct}%` }} />;
        })}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
            <span>{item.label}: ₹{item.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
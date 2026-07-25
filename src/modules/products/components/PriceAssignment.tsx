"use client";

import React from "react";
import { PriceCategory } from "../types/category";

interface PriceAssignmentProps {
  priceCategories: PriceCategory[];
  values: Record<number, number>;
  onChange: (id: number, val: number) => void;
}

export default function PriceAssignment({ priceCategories, values, onChange }: PriceAssignmentProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {priceCategories.map((cat) => (
        <div key={cat.id} className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{cat.price_category_name} Selling Price</label>
          <input
            type="number"
            value={values[cat.id] || ""}
            onChange={(e) => onChange(cat.id, parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            className="h-10 border rounded-lg px-3 text-sm focus:outline-none"
          />
        </div>
      ))}
    </div>
  );
}
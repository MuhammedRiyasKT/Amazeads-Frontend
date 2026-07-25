"use client";

import React from "react";
import { Calculator } from "lucide-react";

interface PricingCalculatorProps {
  material: number;
  printing: number;
  ads: number;
  profit: number; // percentage
  cutting: number;
  packing: number;
  other: number;
  gst: number; // percentage
  sqft: number;
  onCalculated: (costPrice: number, recommendedSellingPrice: number) => void;
}

export default function PricingCalculator({
  material,
  printing,
  ads,
  profit,
  cutting,
  packing,
  other,
  gst,
  sqft,
  onCalculated
}: PricingCalculatorProps) {
  
  // എല്ലാ ചിലവുകളും കൂട്ടിയുള്ള കണക്കുകൂട്ടലുകൾ
  const baseCostPerSqft = material + printing + ads + cutting + packing + other;
  const baseCostTotal = baseCostPerSqft * sqft;
  
  // ലാഭവിഹിതം കാണുന്നു
  const profitAmount = (baseCostTotal * profit) / 100;
  const beforeGstTotal = baseCostTotal + profitAmount;
  
  // ജി.എസ്.ടി
  const gstAmount = (beforeGstTotal * gst) / 100;
  const recommendedSellingPrice = beforeGstTotal + gstAmount;

  React.useEffect(() => {
    onCalculated(baseCostTotal, Math.round(recommendedSellingPrice));
  }, [baseCostTotal, recommendedSellingPrice]);

  return (
    <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
        <Calculator size={16} className="text-slate-500" />
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Live Pricing Calculator</h4>
      </div>

      <div className="grid grid-cols-2 gap-y-2 text-xs font-medium text-slate-600">
        <span>Base Cost/SqFt:</span>
        <span className="text-right">₹{baseCostPerSqft.toFixed(2)}</span>

        <span>Total Base Cost ({sqft} SqFt):</span>
        <span className="text-right">₹{baseCostTotal.toFixed(2)}</span>

        <span>Profit Share ({profit}%):</span>
        <span className="text-right text-emerald-600">+ ₹{profitAmount.toFixed(2)}</span>

        <span>GST Share ({gst}%):</span>
        <span className="text-right text-indigo-600">+ ₹{gstAmount.toFixed(2)}</span>

        <div className="col-span-2 border-t border-slate-200 my-1"></div>

        <span className="font-bold text-slate-800 text-sm">Suggested Sell Price:</span>
        <span className="text-right font-bold text-slate-900 text-sm">₹{Math.round(recommendedSellingPrice)}</span>
      </div>
    </div>
  );
}
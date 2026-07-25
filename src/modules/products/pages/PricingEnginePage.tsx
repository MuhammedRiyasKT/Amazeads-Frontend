"use client";

import React, { useState } from "react";
import PricingCalculator from "../components/PricingCalculator";
import CostBreakdown from "../components/CostBreakdown";

export default function PricingEnginePage() {
  const [material, setMaterial] = useState(100);
  const [printing, setPrinting] = useState(150);
  const [ads, setAds] = useState(30);
  const [profit, setProfit] = useState(20);
  const [cutting, setCutting] = useState(40);
  const [packing, setPacking] = useState(50);
  const [other, setOther] = useState(10);
  const [gst, setGst] = useState(18);
  const [sqft, setSqft] = useState(4);

  const [suggested, setSuggested] = useState(0);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto px-4 py-6">
      <div className="border-b pb-5">
        <h1 className="text-2xl font-bold text-slate-800">Simulate pricing engine</h1>
        <p className="text-sm text-slate-500 mt-1">Play around with pricing variables to quote clients instantly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form simulation inputs */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-xl p-6 shadow-sm flex flex-col gap-4">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">Simulation Parameters</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500">Material Cost</label>
              <input type="number" value={material} onChange={(e) => setMaterial(parseFloat(e.target.value) || 0)} className="h-10 border rounded-lg px-3 text-sm focus:outline-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500">Printing Cost</label>
              <input type="number" value={printing} onChange={(e) => setPrinting(parseFloat(e.target.value) || 0)} className="h-10 border rounded-lg px-3 text-sm focus:outline-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500">Ads Cost</label>
              <input type="number" value={ads} onChange={(e) => setAds(parseFloat(e.target.value) || 0)} className="h-10 border rounded-lg px-3 text-sm focus:outline-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500">Cutting Cost</label>
              <input type="number" value={cutting} onChange={(e) => setCutting(parseFloat(e.target.value) || 0)} className="h-10 border rounded-lg px-3 text-sm focus:outline-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500">Packing Cost</label>
              <input type="number" value={packing} onChange={(e) => setPacking(parseFloat(e.target.value) || 0)} className="h-10 border rounded-lg px-3 text-sm focus:outline-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500">Other Overhead</label>
              <input type="number" value={other} onChange={(e) => setOther(parseFloat(e.target.value) || 0)} className="h-10 border rounded-lg px-3 text-sm focus:outline-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500">Target Profit (%)</label>
              <input type="number" value={profit} onChange={(e) => setProfit(parseFloat(e.target.value) || 0)} className="h-10 border rounded-lg px-3 text-sm focus:outline-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500">GST Share (%)</label>
              <input type="number" value={gst} onChange={(e) => setGst(parseFloat(e.target.value) || 0)} className="h-10 border rounded-lg px-3 text-sm focus:outline-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500">SqFt Size Area</label>
              <input type="number" step="0.1" value={sqft} onChange={(e) => setSqft(parseFloat(e.target.value) || 1)} className="h-10 border rounded-lg px-3 text-sm focus:outline-none" />
            </div>
          </div>
          <div className="mt-3">
            <CostBreakdown material={material} printing={printing} ads={ads} cutting={cutting} packing={packing} other={other} />
          </div>
        </div>

        {/* Right Output details panel */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <PricingCalculator
            material={material}
            printing={printing}
            ads={ads}
            profit={profit}
            cutting={cutting}
            packing={packing}
            other={other}
            gst={gst}
            sqft={sqft}
            onCalculated={(base, rec) => setSuggested(rec)}
          />
        </div>
      </div>
    </div>
  );
}
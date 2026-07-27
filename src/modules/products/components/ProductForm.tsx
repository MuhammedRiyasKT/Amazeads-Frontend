"use client";

import React, { useState, useEffect } from "react";
import { Check, ArrowLeft, ArrowRight, Save, Info, RefreshCw, Layers } from "lucide-react";
import Button from "@/components/ui/Button";
import { Category, PriceCategory } from "../types/category";
import { CreateProductPayload, PriceAssignmentPayload } from "../types/product";

interface ProductFormProps {
  initialData?: any;
  categories: Category[];
  priceCategories: PriceCategory[];
  onSubmit: (payload: CreateProductPayload) => void;
  isSubmitting: boolean;
}

const initialPriceState = (catId: number): PriceAssignmentPayload => ({
  price_category_id: catId,
  material_price: 220,
  printing_price: 150,
  ads_price: 230, // Spacer
  profit: 25, // %
  cutting_price: 50,
  packing: 120, // Courier
  labour_charge: 10, // %
  other: 5, // Other overheads %
  gst: 18, // %
  sqft: 3.00,
  selling_price: 0,
  status: true
});

export default function ProductForm({
  initialData,
  categories,
  priceCategories,
  onSubmit,
  isSubmitting
}: ProductFormProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Info states
  const [productCode, setProductCode] = useState("");
  const [productName, setProductName] = useState("");
  const [productSize, setProductSize] = useState("");
  const [categoryId, setCategoryId] = useState<number>(0);
  const [activeSegments, setActiveSegments] = useState<number[]>([]);

  // Step 2 & 3: Master Rates states
  const [pricingMap, setPricingMap] = useState<Record<number, PriceAssignmentPayload>>({});
  const [activeTab, setActiveTab] = useState<number>(1);
  const [roundOffMap, setRoundOffMap] = useState<Record<number, "x99" | "x95">>({}); // 'none' ഒഴിവാക്കി

  useEffect(() => {
    if (initialData) {
      setProductCode(initialData.item_code);
      setProductName(initialData.product_name);
      setProductSize(initialData.product_size || "12x18");
      setCategoryId(initialData.category_id);

      const activeIds: number[] = [];
      const rates: Record<number, PriceAssignmentPayload> = {};
      const rounds: Record<number, "x99" | "x95"> = {};

      initialData.prices?.forEach((p: any) => {
        activeIds.push(p.price_category_id);
        rates[p.price_category_id] = {
          id: p.id,
          price_category_id: p.price_category_id,
          material_price: p.material_price || 0,
          printing_price: p.printing_price || 0,
          ads_price: p.ads_price || 0,
          profit: p.profit || 0,
          cutting_price: p.cutting_price || 0,
          packing: p.packing || 0,
          labour_charge: p.labour_charge || 0,
          other: p.other || 0,
          gst: p.gst || 0,
          sqft: p.sqft || 1,
          selling_price: p.selling_price || 0,
          status: p.status
        };
        rounds[p.price_category_id] = "x99"; // default to x99
      });

      setActiveSegments(activeIds);
      setPricingMap(rates);
      setRoundOffMap(rounds);
      if (activeIds.length > 0) setActiveTab(activeIds[0]);
    } else {
      const rates: Record<number, PriceAssignmentPayload> = {};
      const rounds: Record<number, "x99" | "x95"> = {};
      priceCategories.forEach((cat) => {
        rates[cat.id] = initialPriceState(cat.id);
        rounds[cat.id] = "x99"; // ഡിഫോൾട്ട് ഓപ്ഷൻ x99 ആക്കി മാറ്റി
      });
      setPricingMap(rates);
      setRoundOffMap(rounds);
      if (priceCategories.length > 0) {
        setActiveSegments([priceCategories[0].id]);
        setActiveTab(priceCategories[0].id);
      }
    }
  }, [initialData, priceCategories]);

  const handleSegmentToggle = (id: number) => {
    setActiveSegments((prev) => {
      const updated = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      if (updated.length > 0 && !updated.includes(activeTab)) {
        setActiveTab(updated[0]);
      }
      return updated;
    });
  };

  const calculateRates = (id: number) => {
    const config = pricingMap[id];
    if (!config) return { subtotal: 0, profitAmount: 0, gstAmount: 0, calculatedPrice: 0 };

    const materialCost = config.sqft * config.material_price;
    const printingCost = config.sqft * config.printing_price;
    
    const baseSubtotal = materialCost + printingCost + config.cutting_price + config.packing + config.ads_price;
    const labourCost = (baseSubtotal * config.labour_charge) / 100;
    const otherOverhead = (baseSubtotal * config.other) / 100;
    
    const subtotal = baseSubtotal + labourCost + otherOverhead;
    const profitAmount = (subtotal * config.profit) / 100;
    const beforeGst = subtotal + profitAmount;
    const gstAmount = (beforeGst * config.gst) / 100;
    const calculatedPrice = beforeGst + gstAmount;

    return {
      subtotal: Math.round(baseSubtotal),
      profitAmount: Math.round(profitAmount),
      gstAmount: Math.round(gstAmount),
      calculatedPrice: Math.round(calculatedPrice)
    };
  };

  const getRoundedPrice = (id: number, calcPrice: number) => {
    const mode = roundOffMap[id] || "x99";
    const base = Math.floor(calcPrice / 100) * 100;
    if (mode === "x99") return base + 99;
    if (mode === "x95") return base + 95;
    return calcPrice;
  };

  const handleUpdateRateField = (segmentId: number, field: keyof PriceAssignmentPayload, value: number) => {
    setPricingMap((prev) => {
      const updated = { ...prev[segmentId], [field]: value };
      return { ...prev, [segmentId]: updated as PriceAssignmentPayload };
    });
  };

  const handleResetAllChanges = () => {
    if (!window.confirm("Are you sure you want to reset all calculations?")) return;
    const rates: Record<number, PriceAssignmentPayload> = {};
    priceCategories.forEach((cat) => {
      rates[cat.id] = initialPriceState(cat.id);
    });
    setPricingMap(rates);
  };

  const handleFinalSubmit = () => {
    const price_assignments = activeSegments.map((id) => {
      const { calculatedPrice } = calculateRates(id);
      const rounded = getRoundedPrice(id, calculatedPrice);
      const current = pricingMap[id];
      
      return {
        ...current,
        selling_price: current.selling_price || rounded
      };
    });

    onSubmit({
      category_id: categoryId,
      product_name: productName,
      item_code: productCode,
      product_size: productSize || "12x18",
      status: true,
      price_assignments
    });
  };

  const getCategoryName = (id: number) => {
    return categories.find((c) => c.id === id)?.category_name || "Amaze Ads";
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Wizard Header Progress Bar */}
      <div className="flex items-center justify-center gap-12 bg-white border border-slate-100 p-4 rounded-xl shadow-sm mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === 1 ? "bg-indigo-600 text-white" : "bg-emerald-500 text-white"}`}>
            {step > 1 ? <Check size={14} /> : "1"}
          </span>
          <span className={`text-xs font-bold ${step === 1 ? "text-indigo-600" : "text-slate-500"}`}>Step 1: Product Info</span>
        </div>
        <div className="w-16 h-[2px] bg-slate-200"></div>
        <div className="flex items-center gap-2">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? "bg-indigo-600 text-white" : step === 3 ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}>
            {step > 2 ? <Check size={14} /> : "2"}
          </span>
          <span className={`text-xs font-bold ${step === 2 ? "text-indigo-600" : "text-slate-400"}`}>Step 2: Master Rates</span>
        </div>
        <div className="w-16 h-[2px] bg-slate-200"></div>
        <div className="flex items-center gap-2">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === 3 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"}`}>
            3
          </span>
          <span className={`text-xs font-bold ${step === 3 ? "text-indigo-600" : "text-slate-400"}`}>Step 3: Pricing Summary</span>
        </div>
      </div>

      {/* ==========================================
          STEP 1: PRODUCT INFO FORM
          ========================================== */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 bg-white border rounded-xl p-6 shadow-sm flex flex-col gap-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-3 mb-2">Product Information</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Product Code *</label>
                <input
                  type="text"
                  placeholder="e.g. PRT-EXT-001"
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  className="h-10 border rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Product Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Exterior Vinyl Wrap"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="h-10 border rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Category *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(parseInt(e.target.value))}
                  className="h-10 border rounded-lg px-3 bg-white text-sm focus:outline-none"
                  required
                >
                  <option value={0}>Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.category_name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Product Size *</label>
                <input
                  type="text"
                  placeholder="e.g. 12x18, 18x24"
                  value={productSize}
                  onChange={(e) => setProductSize(e.target.value)}
                  className="h-10 border rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-4 border-t pt-4">
              <label className="text-xs font-bold text-slate-500 uppercase">Customer Segments *</label>
              <div className="grid grid-cols-3 gap-3">
                {priceCategories.map((cat) => {
                  const isChecked = activeSegments.includes(cat.id);
                  return (
                    <div
                      key={cat.id}
                      onClick={() => handleSegmentToggle(cat.id)}
                      className={`border rounded-lg p-3 flex items-center gap-3 cursor-pointer select-none transition-all ${
                        isChecked ? "border-indigo-600 bg-indigo-50/50" : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className={`w-4 h-4 border rounded flex items-center justify-center ${isChecked ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-300 bg-white"}`}>
                        {isChecked && <Check size={10} />}
                      </div>
                      <span className="text-xs font-bold text-slate-700 capitalize">{cat.price_category_name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t pt-4">
              <Button
                variant="primary"
                onClick={() => {
                  if (!productCode || !productName || !categoryId) {
                    alert("Please fill in all required fields.");
                    return;
                  }
                  if (activeSegments.length === 0) {
                    alert("Please select at least one customer segment.");
                    return;
                  }
                  setStep(2);
                }}
                className="flex items-center gap-1.5 cursor-pointer"
              >
                Continue to Master Rates <ArrowRight size={14} />
              </Button>
            </div>
          </div>

          {/* Selected Summary Sidebar */}
          <div className="lg:col-span-1 bg-white border rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b pb-3 mb-4">Selected Summary</h3>
            <div className="flex flex-col gap-3.5 text-xs font-medium text-slate-600">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Product Code</span>
                <span className="font-bold text-slate-800 mt-0.5">{productCode || "—"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Product Name</span>
                <span className="font-bold text-slate-800 mt-0.5">{productName || "—"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Category</span>
                <span className="font-bold text-slate-800 mt-0.5">{getCategoryName(categoryId)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          STEP 2: MASTER RATES / LIVE CALCULATOR
          ========================================== */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 bg-white border rounded-xl p-6 shadow-sm flex flex-col gap-4">
            
            <div className="flex gap-2 border-b pb-3 mb-2">
              {activeSegments.map((id) => {
                const name = priceCategories.find((c) => c.id === id)?.price_category_name || "";
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`px-5 py-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer capitalize ${
                      activeTab === id
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>

            {pricingMap[activeTab] && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Material Price / SqFt</label>
                    <input
                      type="number"
                      value={pricingMap[activeTab].material_price}
                      onChange={(e) => handleUpdateRateField(activeTab, "material_price", parseFloat(e.target.value) || 0)}
                      className="h-10 border rounded-lg px-3 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Printing Price / SqFt</label>
                    <input
                      type="number"
                      value={pricingMap[activeTab].printing_price}
                      onChange={(e) => handleUpdateRateField(activeTab, "printing_price", parseFloat(e.target.value) || 0)}
                      className="h-10 border rounded-lg px-3 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Cutting Cost</label>
                    <input
                      type="number"
                      value={pricingMap[activeTab].cutting_price}
                      onChange={(e) => handleUpdateRateField(activeTab, "cutting_price", parseFloat(e.target.value) || 0)}
                      className="h-10 border rounded-lg px-3 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Packing & Spacer</label>
                    <input
                      type="number"
                      value={pricingMap[activeTab].packing}
                      onChange={(e) => handleUpdateRateField(activeTab, "packing", parseFloat(e.target.value) || 0)}
                      className="h-10 border rounded-lg px-3 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Spacer charges</label>
                    <input
                      type="number"
                      value={pricingMap[activeTab].ads_price}
                      onChange={(e) => handleUpdateRateField(activeTab, "ads_price", parseFloat(e.target.value) || 0)}
                      className="h-10 border rounded-lg px-3 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Labour %</label>
                    <input
                      type="number"
                      value={pricingMap[activeTab].labour_charge}
                      onChange={(e) => handleUpdateRateField(activeTab, "labour_charge", parseFloat(e.target.value) || 0)}
                      className="h-10 border rounded-lg px-3 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Other overheads %</label>
                    <input
                      type="number"
                      value={pricingMap[activeTab].other}
                      onChange={(e) => handleUpdateRateField(activeTab, "other", parseFloat(e.target.value) || 0)}
                      className="h-10 border rounded-lg px-3 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">GST %</label>
                    <input
                      type="number"
                      value={pricingMap[activeTab].gst}
                      onChange={(e) => handleUpdateRateField(activeTab, "gst", parseFloat(e.target.value) || 0)}
                      className="h-10 border rounded-lg px-3 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Total Area (SqFt)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={pricingMap[activeTab].sqft}
                      onChange={(e) => handleUpdateRateField(activeTab, "sqft", parseFloat(e.target.value) || 1)}
                      className="h-10 border rounded-lg px-3 text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mt-6 border-t pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                <ArrowLeft size={14} /> Back to Product Info
              </button>

              <Button
                variant="primary"
                onClick={() => setStep(3)}
                className="flex items-center gap-1.5 cursor-pointer"
              >
                Verify and Submit Product <ArrowRight size={14} />
              </Button>
            </div>
          </div>

          {/* Live Calculator Sidebar */}
          <div className="lg:col-span-1 bg-white border rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b pb-3 mb-4">Live Calculator</h3>
            
            {pricingMap[activeTab] && (() => {
              const { subtotal, profitAmount, gstAmount, calculatedPrice } = calculateRates(activeTab);
              const rounded = getRoundedPrice(activeTab, calculatedPrice);
              const name = priceCategories.find((c) => c.id === activeTab)?.price_category_name || "";

              return (
                <div className="flex flex-col gap-4 text-xs font-medium text-slate-600">
                  <div className="flex justify-between border-b pb-1.5">
                    <span>Material Cost ({pricingMap[activeTab].sqft} SqFt):</span>
                    <span className="text-slate-800 font-bold">₹{Math.round(pricingMap[activeTab].sqft * pricingMap[activeTab].material_price)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span>Printing Cost ({pricingMap[activeTab].sqft} SqFt):</span>
                    <span className="text-slate-800 font-bold">₹{Math.round(pricingMap[activeTab].sqft * pricingMap[activeTab].printing_price)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span>Subtotal Cost:</span>
                    <span className="text-slate-800 font-bold">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span>Profit margin ({pricingMap[activeTab].profit}%):</span>
                    <span className="text-emerald-600 font-bold">+ ₹{profitAmount}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span>GST ({pricingMap[activeTab].gst}%):</span>
                    <span className="text-indigo-600 font-bold">+ ₹{gstAmount}</span>
                  </div>
                  <div className="flex justify-between items-center bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100 my-2">
                    <span className="font-bold text-slate-700">Calculated Price:</span>
                    <strong className="text-lg text-indigo-700 font-bold">₹{calculatedPrice}</strong>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ==========================================
          STEP 3: PRICING BY CUSTOMER TYPE
          ========================================== */}
      {step === 3 && (
        <div className="bg-white border rounded-xl p-6 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b pb-4 mb-2">
            <div>
              <h2 className="text-base font-bold text-slate-800 tracking-tight">Pricing by Customer Type</h2>
              <p className="text-xs text-slate-400 mt-1">Fine-tune target pricing classifications before submission.</p>
            </div>
            
            {/* Summary details */}
            <div className="flex gap-6 text-xs font-semibold text-slate-600">
              <div>Code: <strong className="text-slate-800">{productCode}</strong></div>
              <div>Name: <strong className="text-slate-800">{productName}</strong></div>
              <div>Category: <strong className="text-slate-800">{getCategoryName(categoryId)}</strong></div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {activeSegments.map((segmentId) => {
              const current = pricingMap[segmentId];
              const { subtotal, profitAmount, gstAmount, calculatedPrice } = calculateRates(segmentId);
              const rounded = getRoundedPrice(segmentId, calculatedPrice);
              const name = priceCategories.find((c) => c.id === segmentId)?.price_category_name || "";

              return (
                <div key={segmentId} className="border border-slate-100 rounded-xl p-5 bg-slate-50/30 flex flex-col gap-4">
                  {/* segment header info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800 capitalize">{name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700">Active</span>
                    </div>
                  </div>

                  {/* calculation variables grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-3 text-xs font-semibold text-slate-500">
                    <div className="flex flex-col"><span>Area:</span><span className="text-slate-800 font-bold">{current.sqft}</span></div>
                    <div className="flex flex-col"><span>Material:</span><span className="text-slate-800 font-bold">₹{current.material_price}</span></div>
                    <div className="flex flex-col"><span>Print/Cut:</span><span className="text-slate-800 font-bold">₹{current.cutting_price}</span></div>
                    <div className="flex flex-col"><span>Pack/Space:</span><span className="text-slate-800 font-bold">₹{current.ads_price}</span></div>
                    <div className="flex flex-col"><span>Courier:</span><span className="text-slate-800 font-bold">₹{current.packing}</span></div>
                    <div className="flex flex-col"><span>Labour:</span><span className="text-slate-800 font-bold">{current.labour_charge}%</span></div>
                    <div className="flex flex-col"><span>Subtotal:</span><span className="text-slate-800 font-bold">₹{subtotal}</span></div>
                    <div className="flex flex-col"><span>Profit:</span><span className="text-emerald-600 font-bold">₹{profitAmount}</span></div>
                    <div className="flex flex-col"><span>GST:</span><span className="text-indigo-600 font-bold">₹{gstAmount}</span></div>
                    <div className="flex flex-col"><span>Calculated:</span><strong className="text-indigo-700 font-bold">₹{calculatedPrice}</strong></div>
                  </div>

                  {/* Round-off and editable fields row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end border-t pt-4 mt-2">

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Final Price (Editable)</span>
                      <input
                        type="number"
                        placeholder={rounded.toString()}
                        value={current.selling_price || ""}
                        onChange={(e) => handleUpdateRateField(segmentId, "selling_price", parseFloat(e.target.value) || 0)}
                        className="h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none font-bold text-indigo-600 bg-white"
                      />
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-2.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const recalculated = getRoundedPrice(segmentId, calculatedPrice);
                          handleUpdateRateField(segmentId, "selling_price", recalculated);
                          alert(`${name} price has been re-calculated and updated.`);
                        }}
                        className="cursor-pointer border-slate-200"
                      >
                        Update Price
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center mt-6 border-t pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to Master Rates
            </button>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetAllChanges}
                className="cursor-pointer border-slate-200"
              >
                Reset All Changes
              </Button>
              <Button
                variant="primary"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 cursor-pointer"
              >
                <Save size={14} /> {isSubmitting ? "Submitting..." : "Submit All Pricing"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
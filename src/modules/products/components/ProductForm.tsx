"use client";

import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { CreateProductPayload } from "../types/product";
import { Category, PriceCategory } from "../types/category"; // ശരിയാക്കിയ ഇമ്പോർട്ട് പാത്ത്
import PricingCalculator from "./PricingCalculator";

interface ProductFormProps {
  initialData?: any;
  categories: Category[];
  priceCategories: PriceCategory[];
  onSubmit: (payload: CreateProductPayload) => void;
  isSubmitting: boolean;
}

export default function ProductForm({
  initialData,
  categories,
  priceCategories,
  onSubmit,
  isSubmitting
}: ProductFormProps) {
  const [productName, setProductName] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [productSize, setProductSize] = useState("");
  const [categoryId, setCategoryId] = useState<number>(0);
  const [status, setStatus] = useState(true);

  // Price variables
  const [material, setMaterial] = useState(0);
  const [printing, setPrinting] = useState(0);
  const [ads, setAds] = useState(0);
  const [profit, setProfit] = useState(0);
  const [cutting, setCutting] = useState(0);
  const [packing, setPacking] = useState(0);
  const [other, setOther] = useState(0);
  const [gst, setGst] = useState(18); // Default to standard GST
  const [sqft, setSqft] = useState(1);

  // Suggested price states
  const [suggestedPrice, setSuggestedPrice] = useState(0);

  // Price category assignments
  const [assignments, setAssignments] = useState<Record<number, number>>({});

  useEffect(() => {
    if (initialData) {
      setProductName(initialData.product_name);
      setItemCode(initialData.item_code);
      setProductSize(initialData.product_size);
      setCategoryId(initialData.category_id);
      setStatus(initialData.status);
      setMaterial(initialData.material_price);
      setPrinting(initialData.printing_price);
      setAds(initialData.ads_price);
      setProfit(initialData.profit);
      setCutting(initialData.cutting_price);
      setPacking(initialData.packing);
      setOther(initialData.other);
      setGst(initialData.gst);
      setSqft(initialData.sqft);

      // Map prices to assignment state
      const mapped: Record<number, number> = {};
      initialData.prices?.forEach((p: any) => {
        mapped[p.price_category_id] = p.selling_price;
      });
      setAssignments(mapped);
    }
  }, [initialData]);

  const handlePriceChange = (priceCatId: number, val: number) => {
    setAssignments((prev) => ({
      ...prev,
      [priceCatId]: val
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      alert("Please select a valid category");
      return;
    }

    const priceAssignmentsArray = priceCategories.map((cat) => ({
      price_category_id: cat.id,
      selling_price: assignments[cat.id] || suggestedPrice, // Fallback to suggested price if empty
      status: true
    }));

    onSubmit({
      category_id: categoryId,
      product_name: productName,
      item_code: itemCode,
      product_size: productSize,
      status,
      material_price: material,
      printing_price: printing,
      ads_price: ads,
      profit,
      cutting_price: cutting,
      packing,
      other,
      gst,
      sqft,
      price_assignments: priceAssignmentsArray
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Product Details */}
      <div className="lg:col-span-2 bg-white border border-slate-100 rounded-xl p-6 shadow-sm flex flex-col gap-4">
        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide border-b pb-3 mb-2">Product Information</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Name</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Item Code</label>
            <input
              type="text"
              value={itemCode}
              onChange={(e) => setItemCode(e.target.value)}
              className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(parseInt(e.target.value))}
              className="w-full h-10 border border-slate-200 rounded-lg px-3 bg-white text-sm focus:outline-none"
              required
            >
              <option value={0}>Choose Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.category_name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Size</label>
            <input
              type="text"
              value={productSize}
              onChange={(e) => setProductSize(e.target.value)}
              className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
            <select
              value={status ? "true" : "false"}
              onChange={(e) => setStatus(e.target.value === "true")}
              className="w-full h-10 border border-slate-200 rounded-lg px-3 bg-white text-sm focus:outline-none"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        {/* Pricing Fields Grid */}
        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide border-b pb-3 mt-4 mb-2">Cost Breakdown</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase">Material Price</label>
            <input type="number" value={material} onChange={(e) => setMaterial(parseFloat(e.target.value) || 0)} className="h-10 border border-slate-200 rounded-lg px-3 text-sm" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase">Printing Price</label>
            <input type="number" value={printing} onChange={(e) => setPrinting(parseFloat(e.target.value) || 0)} className="h-10 border border-slate-200 rounded-lg px-3 text-sm" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase">Ads Price</label>
            <input type="number" value={ads} onChange={(e) => setAds(parseFloat(e.target.value) || 0)} className="h-10 border border-slate-200 rounded-lg px-3 text-sm" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase">Cutting Price</label>
            <input type="number" value={cutting} onChange={(e) => setCutting(parseFloat(e.target.value) || 0)} className="h-10 border border-slate-200 rounded-lg px-3 text-sm" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase">Packing Rate</label>
            <input type="number" value={packing} onChange={(e) => setPacking(parseFloat(e.target.value) || 0)} className="h-10 border border-slate-200 rounded-lg px-3 text-sm" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase">Other Cost</label>
            <input type="number" value={other} onChange={(e) => setOther(parseFloat(e.target.value) || 0)} className="h-10 border border-slate-200 rounded-lg px-3 text-sm" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase">GST (%)</label>
            <input type="number" value={gst} onChange={(e) => setGst(parseFloat(e.target.value) || 0)} className="h-10 border border-slate-200 rounded-lg px-3 text-sm" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase">SqFt Area</label>
            <input type="number" step="0.1" value={sqft} onChange={(e) => setSqft(parseFloat(e.target.value) || 1)} className="h-10 border border-slate-200 rounded-lg px-3 text-sm" />
          </div>
        </div>

        {/* Dynamic Price Categories assignments */}
        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide border-b pb-3 mt-4 mb-2">Target Pricing</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {priceCategories.map((cat) => (
            <div key={cat.id} className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {cat.price_category_name} Selling Price
              </label>
              <input
                type="number"
                placeholder={`Suggested: ₹${suggestedPrice}`}
                value={assignments[cat.id] || ""}
                onChange={(e) => handlePriceChange(cat.id, parseFloat(e.target.value) || 0)}
                className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Dynamic Pricing Engine Sidebar */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        {/* Cost Calculator */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b pb-3 mb-4">Pricing Engine</h3>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profit Margin (%)</label>
              <input
                type="number"
                value={profit}
                onChange={(e) => setProfit(parseFloat(e.target.value) || 0)}
                className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none"
              />
            </div>

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
              onCalculated={(baseCost, recPrice) => setSuggestedPrice(recPrice)}
            />

            <Button variant="primary" size="md" type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Processing..." : "Save Product Details"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
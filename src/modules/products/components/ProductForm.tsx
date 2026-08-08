"use client";

import React, { useState, useEffect } from "react";
import { Check, ArrowLeft, ArrowRight, Save, Trash2, Plus, Calculator } from "lucide-react";
import Button from "@/components/ui/Button";
import { Category, PriceCategory } from "../types/category";
import { CreateProductPayload } from "../types/product";

interface ProductFormProps {
  initialData?: any;
  categories: Category[];
  priceCategories: PriceCategory[];
  onSubmit: (payload: CreateProductPayload) => void;
  isSubmitting: boolean;
}

// Local State Interfaces
export interface AdditionalPriceLocal {
  id?: number;
  name: string;
  unit_name: "flat" | "percentage" | "area";
  price: number;
  status: boolean;
}

export interface PriceAssignmentLocal {
  id?: number;
  price_category_id: number;
  material_price: number;
  printing_price: number;
  ads_price: number;
  profit: number;
  cutting_price: number;
  packing: number;
  courier_price: number; // Local Courier Charge
  labour_charge: number;
  other: number; // Mapped to Advertisement %
  gst: number;
  sqft: number;
  selling_price: number;
  status: boolean;
  custom_fields: AdditionalPriceLocal[];
}

const initialPriceState = (catId: number): PriceAssignmentLocal => ({
  price_category_id: catId,
  material_price: 0,
  printing_price: 0,
  ads_price: 0,
  profit: 25, // Profit %
  cutting_price: 0,
  packing: 0,
  courier_price: 120, // Default Courier Charge (Flat ₹)
  labour_charge: 10, // Labour Charge %
  other: 5, // Advertisement %
  gst: 18, // GST %
  sqft: 3.00, // Square Feet
  selling_price: 0,
  status: true,
  custom_fields: [] // Dynamic additional_prices
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

  // Step 2 & 3: Pricing states
  const [pricingMap, setPricingMap] = useState<Record<number, PriceAssignmentLocal>>({});
  const [activeTab, setActiveTab] = useState<number>(1);
  const [roundOffMap, setRoundOffMap] = useState<Record<number, "x99" | "x95">>({});

  // Additional Charge creation form state
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldUnit, setNewFieldUnit] = useState<"flat" | "percentage" | "area">("percentage");
  const [newFieldPrice, setNewFieldPrice] = useState<number>(0);

  // Populate data on mount or edit
  useEffect(() => {
    if (initialData) {
      setProductCode(initialData.item_code || "");
      setProductName(initialData.product_name || "");
      setProductSize(initialData.product_size || "12x18");
      setCategoryId(initialData.category_id || 0);

      const activeIds: number[] = [];
      const rates: Record<number, PriceAssignmentLocal> = {};
      const rounds: Record<number, "x99" | "x95"> = {};

      initialData.prices?.forEach((p: any) => {
        activeIds.push(p.price_category_id);

        // Map existing additional_prices if editing
        const existingAdditional: AdditionalPriceLocal[] = (p.additional_prices || []).map((ap: any) => ({
          id: ap.id,
          name: ap.name || ap.label || "Custom Charge",
          unit_name: ((ap.unit_name || "flat").toLowerCase() as "flat" | "percentage" | "area"),
          price: ap.price !== undefined ? ap.price : ap.value || 0,
          status: ap.status !== undefined ? ap.status : true,
        }));

        rates[p.price_category_id] = {
          id: p.id,
          price_category_id: p.price_category_id,
          material_price: p.material_price || 0,
          printing_price: p.printing_price || 0,
          ads_price: p.ads_price || 0,
          profit: p.profit || 0,
          cutting_price: p.cutting_price || 0,
          packing: p.packing || 0,
          courier_price: p.courier_charge || p.courier_price || 0,
          labour_charge: p.labour_charge || 0,
          other: p.other || 0, // Advertisement %
          gst: p.gst || 0,
          sqft: p.sqft || 1,
          selling_price: p.selling_price || 0,
          status: p.status !== undefined ? p.status : true,
          custom_fields: existingAdditional
        };
        rounds[p.price_category_id] = "x99";
      });

      setActiveSegments(activeIds);
      setPricingMap(rates);
      setRoundOffMap(rounds);
      if (activeIds.length > 0) setActiveTab(activeIds[0]);
    } else {
      const rates: Record<number, PriceAssignmentLocal> = {};
      const rounds: Record<number, "x99" | "x95"> = {};
      priceCategories.forEach((cat) => {
        rates[cat.id] = initialPriceState(cat.id);
        rounds[cat.id] = "x99";
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

  // Dynamic Additional Charges Management
  const handleAddCustomField = (segmentId: number) => {
    if (!newFieldName.trim()) {
      alert("Please enter a field name first!");
      return;
    }
    setPricingMap((prev) => {
      const current = prev[segmentId];
      if (!current) return prev;
      return {
        ...prev,
        [segmentId]: {
          ...current,
          custom_fields: [
            ...(current.custom_fields || []),
            {
              name: newFieldName.trim(),
              unit_name: newFieldUnit,
              price: Number(newFieldPrice) || 0,
              status: true
            }
          ]
        }
      };
    });
    setNewFieldName("");
    setNewFieldPrice(0);
  };

  const handleRemoveCustomField = (segmentId: number, index: number) => {
    setPricingMap((prev) => {
      const current = prev[segmentId];
      if (!current) return prev;
      return {
        ...prev,
        [segmentId]: {
          ...current,
          custom_fields: (current.custom_fields || []).filter((_, i) => i !== index)
        }
      };
    });
  };

  const handleUpdateCustomFieldVal = (segmentId: number, index: number, field: "price" | "unit_name", val: any) => {
    setPricingMap((prev) => {
      const current = prev[segmentId];
      if (!current) return prev;
      const updatedFields = [...(current.custom_fields || [])];
      updatedFields[index] = { ...updatedFields[index], [field]: val };
      return {
        ...prev,
        [segmentId]: {
          ...current,
          custom_fields: updatedFields
        }
      };
    });
  };

  const handleUpdateRateField = (segmentId: number, field: keyof PriceAssignmentLocal, value: any) => {
    setPricingMap((prev) => {
      const updated = { ...prev[segmentId], [field]: value };
      return { ...prev, [segmentId]: updated as PriceAssignmentLocal };
    });
  };

  // 🌟 EXACT LIVE CALCULATOR ENGINE
  const calculateRates = (id: number) => {
    const config = pricingMap[id];
    if (!config) {
      return {
        sqft: 1,
        baseCost: 0,
        courierCost: 0,
        labourCost: 0,
        otherAdvCost: 0,
        additionalDetails: [],
        subtotal: 0,
        profitAmount: 0,
        gstAmount: 0,
        calculatedPrice: 0
      };
    }

    const sqft = config.sqft || 1;
    const courierCost = config.courier_price || 0; // Flat Courier Charge

    // Hidden fields preserved for edit mode (0 for new products)
    const hiddenMaterial = sqft * (config.material_price || 0);
    const hiddenPrinting = sqft * (config.printing_price || 0);
    const hiddenCutting = config.cutting_price || 0;
    const hiddenPacking = config.packing || 0;
    const hiddenAds = config.ads_price || 0;

    // 1. Calculate Flat and Area Additional Charges
    let additionalFlatSum = 0;
    let additionalAreaSum = 0;

    (config.custom_fields || []).forEach((f) => {
      const unit = (f.unit_name || "flat").toLowerCase();
      if (unit === "flat") {
        additionalFlatSum += f.price || 0;
      } else if (unit === "area") {
        additionalAreaSum += sqft * (f.price || 0);
      }
    });

    // Base Cost = Courier + Flat Charges + Area Charges
    const baseCost = courierCost + hiddenMaterial + hiddenPrinting + hiddenCutting + hiddenPacking + hiddenAds + additionalFlatSum + additionalAreaSum;

    // 2. Calculate Percentage Additional Charges & Prepare Itemized Breakdown
    let additionalPercentSum = 0;
    const additionalDetails: Array<{ name: string; unit_name: string; price: number; calculatedAmount: number }> = [];

    (config.custom_fields || []).forEach((f) => {
      const unit = (f.unit_name || "flat").toLowerCase();
      let amt = 0;
      if (unit === "flat") {
        amt = f.price || 0;
      } else if (unit === "area") {
        amt = sqft * (f.price || 0);
      } else if (unit === "percentage") {
        amt = (baseCost * (f.price || 0)) / 100;
        additionalPercentSum += amt;
      }

      additionalDetails.push({
        name: f.name,
        unit_name: unit,
        price: f.price || 0,
        calculatedAmount: Math.round(amt)
      });
    });

    // Default Percentages: Labour % and Advertisement %
    const labourCost = (baseCost * (config.labour_charge || 0)) / 100; // e.g. 10% of 300 = 30
    const otherAdvCost = (baseCost * (config.other || 0)) / 100; // e.g. 5% of 300 = 15

    // Subtotal = Base + Labour + Advertisement + Percentage Additional Charges
    const subtotal = baseCost + labourCost + otherAdvCost + additionalPercentSum;
    
    // Profit = Subtotal * Profit % / 100
    const profitAmount = (subtotal * (config.profit || 0)) / 100; // e.g. 25% of 369 = 92
    const beforeGst = subtotal + profitAmount;
    
    // GST = (Subtotal + Profit) * GST % / 100
    const gstAmount = (beforeGst * (config.gst || 0)) / 100; // e.g. 18% of 461 = 83
    const calculatedPrice = beforeGst + gstAmount;

    return {
      sqft,
      baseCost: Math.round(baseCost),
      courierCost: Math.round(courierCost),
      labourCost: Math.round(labourCost), // 🌟 Rupee Amount (30)
      otherAdvCost: Math.round(otherAdvCost), // 🌟 Rupee Amount (15)
      additionalDetails,
      subtotal: Math.round(subtotal),
      profitAmount: Math.round(profitAmount), // 🌟 Rupee Amount (92)
      gstAmount: Math.round(gstAmount), // 🌟 Rupee Amount (83)
      calculatedPrice: Math.round(calculatedPrice) // 🌟 Rupee Amount (544)
    };
  };

  const getRoundedPrice = (id: number, calcPrice: number) => {
    const mode = roundOffMap[id] || "x99";
    const base = Math.floor(calcPrice / 100) * 100;
    if (mode === "x99") return base + 99;
    if (mode === "x95") return base + 95;
    return calcPrice;
  };

  const handleResetAllChanges = () => {
    if (!window.confirm("Are you sure you want to reset all calculations?")) return;
    const rates: Record<number, PriceAssignmentLocal> = {};
    priceCategories.forEach((cat) => {
      rates[cat.id] = initialPriceState(cat.id);
    });
    setPricingMap(rates);
  };

  // 🌟 FINAL SUBMIT PAYLOAD (Sends Calculated Rupee Values to Backend)
  const handleFinalSubmit = () => {
    const price_assignments = activeSegments.map((id) => {
      // 🌟 Live Calculator കണ്ടുപിടിച്ച രൂപയുടെ തുകകൾ എടുക്കുന്നു
      const { 
        courierCost, 
        labourCost, 
        otherAdvCost, 
        profitAmount, 
        gstAmount, 
        calculatedPrice 
      } = calculateRates(id);

      const rounded = getRoundedPrice(id, calculatedPrice);
      const current = pricingMap[id];

      // Format additional_prices for API schema
      const additional_prices = (current.custom_fields || []).map((f) => ({
        name: f.name.toLowerCase(),
        unit_name: f.unit_name.toLowerCase(),
        price: Number(f.price || 0),
        status: f.status !== undefined ? f.status : true
      }));

      return {
        id: current.id,
        price_category_id: current.price_category_id,
        material_price: current.material_price || 0,
        printing_price: current.printing_price || 0,
        ads_price: current.ads_price || 0, // Spacer Charge
        cutting_price: current.cutting_price || 0,
        packing: current.packing || 0,
        spacer_charge: current.ads_price || 0,
        
        // 🌟 ശതമാനത്തിന് പകരം ലൈവ് കാൽക്കുലേറ്ററിലെ രൂപയുടെ തുകകൾ (Rupee Values) അയക്കുന്നു
        labour_charge: labourCost, // e.g. 30 (instead of 10)
        other: otherAdvCost, // e.g. 15 (instead of 5)
        profit: profitAmount, // e.g. 92 (instead of 25)
        gst: gstAmount, // e.g. 83 (instead of 18)

        sqft: current.sqft || 1,
        courier_charge: courierCost, // 120
        selling_price: current.selling_price || rounded, // 599
        status: current.status !== undefined ? current.status : true,
        additional_prices: additional_prices
      };
    });

    onSubmit({
      category_id: categoryId,
      product_name: productName,
      item_code: productCode,
      product_size: productSize || "12x18",
      status: true,
      price_assignments: price_assignments as any
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
                  className="h-10 border rounded-lg px-3 text-sm focus:outline-none"
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
                  className="h-10 border rounded-lg px-3 text-sm focus:outline-none"
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
                  className="h-10 border rounded-lg px-3 bg-white text-sm focus:outline-none cursor-pointer"
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
                  className="h-10 border rounded-lg px-3 text-sm focus:outline-none"
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
          
          {/* Left Side: Master Rates Form */}
          <div className="lg:col-span-2 bg-white border rounded-xl p-6 shadow-sm flex flex-col gap-4">
            
            {/* Segment Tab Selector */}
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

            {/* Master Rates Fields */}
            {pricingMap[activeTab] && (
              <div className="flex flex-col gap-4">
                <div className="border-b pb-3 mb-2">
                  <h2 className="text-sm font-bold text-slate-800">Master Rates</h2>
                  <p className="text-xs text-slate-400 mt-1">Configure default rate inputs & dynamic additional charges per segment.</p>
                </div>

                {/* SKU & Product Header */}
                <div className="flex flex-col gap-1 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                  <span className="text-xs font-bold text-slate-700">Product: <span className="text-indigo-600">{productName} / {productSize}</span></span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">SKU: {productCode}-{productSize}</span>
                </div>

                {/* DEFAULT EDITABLE FIELDS GRID */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                  
                  {/* Square Feet */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Square Feet *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={pricingMap[activeTab].sqft}
                      onChange={(e) => handleUpdateRateField(activeTab, "sqft", parseFloat(e.target.value) || 0)}
                      className="h-10 border border-slate-300 rounded-lg px-3 text-sm focus:outline-none bg-white font-bold text-slate-800"
                      required
                    />
                  </div>

                  {/* Profit % */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Profit % *</label>
                    <input
                      type="number"
                      value={pricingMap[activeTab].profit}
                      onChange={(e) => handleUpdateRateField(activeTab, "profit", parseFloat(e.target.value) || 0)}
                      className="h-10 border border-slate-300 rounded-lg px-3 text-sm focus:outline-none"
                    />
                  </div>

                  {/* Labour Charge % */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Labour Charge %</label>
                    <input
                      type="number"
                      value={pricingMap[activeTab].labour_charge}
                      onChange={(e) => handleUpdateRateField(activeTab, "labour_charge", parseFloat(e.target.value) || 0)}
                      className="h-10 border border-slate-300 rounded-lg px-3 text-sm focus:outline-none"
                    />
                  </div>

                  {/* Advertisement % */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Advertisement %</label>
                    <input
                      type="number"
                      value={pricingMap[activeTab].other}
                      onChange={(e) => handleUpdateRateField(activeTab, "other", parseFloat(e.target.value) || 0)}
                      className="h-10 border border-slate-300 rounded-lg px-3 text-sm focus:outline-none"
                    />
                  </div>

                  {/* GST % */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">GST % *</label>
                    <input
                      type="number"
                      value={pricingMap[activeTab].gst}
                      onChange={(e) => handleUpdateRateField(activeTab, "gst", parseFloat(e.target.value) || 0)}
                      className="h-10 border border-slate-300 rounded-lg px-3 text-sm focus:outline-none"
                    />
                  </div>

                  {/* Courier Charge ₹ (Flat) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Courier Charge ₹ (Flat)</label>
                    <input
                      type="number"
                      value={pricingMap[activeTab].courier_price}
                      onChange={(e) => handleUpdateRateField(activeTab, "courier_price", parseFloat(e.target.value) || 0)}
                      className="h-10 border border-slate-300 rounded-lg px-3 text-sm focus:outline-none bg-white font-bold text-slate-800"
                    />
                  </div>
                </div>

                {/* ADDITIONAL DYNAMIC CHARGES SECTION */}
                <div className="flex flex-col gap-3 mt-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">ADDITIONAL CHARGES</h3>
                      <p className="text-[11px] text-slate-400">Configure Flat, Percentage, or Area-based dynamic surcharges.</p>
                    </div>
                  </div>

                  {/* Display Added Additional Charges List */}
                  {(pricingMap[activeTab].custom_fields || []).length > 0 ? (
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                            <th className="py-2.5 px-3">Name</th>
                            <th className="py-2.5 px-3">Unit Type</th>
                            <th className="py-2.5 px-3">Value</th>
                            <th className="py-2.5 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {pricingMap[activeTab].custom_fields.map((field, fIdx) => (
                            <tr key={fIdx} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-3 font-bold text-slate-800 capitalize">{field.name}</td>
                              <td className="py-2.5 px-3 font-semibold text-slate-500 uppercase text-[10px]">
                                <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 inline-block capitalize">
                                  {field.unit_name}
                                </span>
                              </td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="number"
                                  value={field.price}
                                  onChange={(e) => handleUpdateCustomFieldVal(activeTab, fIdx, "price", parseFloat(e.target.value) || 0)}
                                  className="h-7 w-28 border border-slate-300 rounded px-2 text-xs font-bold text-slate-800 focus:outline-none"
                                />
                                <span className="ml-1 text-slate-400 text-[10px]">
                                  {field.unit_name === "percentage" ? "%" : "₹"}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCustomField(activeTab, fIdx)}
                                  className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                  title="Delete charge"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs text-slate-400 italic">
                      No additional charges added for this segment yet.
                    </div>
                  )}

                  {/* Inline Form to Add New Additional Charge */}
                  <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-end gap-3 mt-1">
                    <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Name *</span>
                      <input
                        type="text"
                        placeholder="e.g. Markup Percentage, Wood Box"
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                        className="h-9 border border-slate-300 rounded-lg px-3 text-xs focus:outline-none bg-white font-medium"
                      />
                    </div>

                    <div className="flex flex-col gap-1 w-32">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Unit Type *</span>
                      <select
                        value={newFieldUnit}
                        onChange={(e) => setNewFieldUnit(e.target.value as any)}
                        className="h-9 border border-slate-300 rounded-lg px-2 bg-white text-xs font-bold focus:outline-none cursor-pointer"
                      >
                        <option value="percentage">Percentage</option>
                        <option value="flat">Flat</option>
                        <option value="area">Area</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1 w-28">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Value *</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={newFieldPrice || ""}
                        onChange={(e) => setNewFieldPrice(parseFloat(e.target.value) || 0)}
                        className="h-9 border border-slate-300 rounded-lg px-3 text-xs font-bold text-slate-800 focus:outline-none bg-white"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddCustomField(activeTab)}
                      className="h-9 px-4 border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <Plus size={14} /> Add Field
                    </button>
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

          {/* 🌟 Right Side: Live Price Calculator */}
          <div className="lg:col-span-1 bg-white border rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b pb-3 mb-4 flex items-center gap-1.5">
              <Calculator size={14} className="text-indigo-600" /> LIVE CALCULATOR
            </h3>
            
            {pricingMap[activeTab] && (() => {
              const { sqft, courierCost, labourCost, otherAdvCost, additionalDetails, subtotal, profitAmount, gstAmount, calculatedPrice } = calculateRates(activeTab);
              const rounded = getRoundedPrice(activeTab, calculatedPrice);
              const name = priceCategories.find((c) => c.id === activeTab)?.price_category_name || "";

              return (
                <div className="flex flex-col gap-4 text-xs font-medium text-slate-600">
                  
                  {/* Area Readout */}
                  <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Area (sqft)</span>
                    <strong className="text-slate-900 font-extrabold text-sm">{sqft} sqft</strong>
                  </div>

                  {/* Itemized Calculation Breakdown */}
                  <div className="flex flex-col gap-2 mt-1 border-t pt-3">
                    
                    {/* Courier Charge */}
                    <div className="flex justify-between border-b border-dashed pb-1">
                      <span>Courier:</span> <span className="text-slate-800 font-bold">₹{courierCost}</span>
                    </div>

                    {/* Labour Charge (₹ Value) */}
                    <div className="flex justify-between border-b border-dashed pb-1">
                      <span>Labour ({pricingMap[activeTab].labour_charge}%):</span> <span className="text-slate-800 font-bold">₹{labourCost}</span>
                    </div>

                    {/* Advertisement (₹ Value) */}
                    <div className="flex justify-between border-b border-dashed pb-1">
                      <span>Advertisement ({pricingMap[activeTab].other}%):</span> <span className="text-slate-800 font-bold">₹{otherAdvCost}</span>
                    </div>

                    {/* Itemized Additional Charges Breakdown */}
                    {additionalDetails.length > 0 && (
                      <div className="flex flex-col gap-1.5 my-1 border-t border-b border-slate-200/80 py-2 bg-slate-50/50 px-2 rounded-md">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Additional Charges:</span>
                        {additionalDetails.map((add, aIdx) => (
                          <div key={aIdx} className="flex justify-between text-slate-700 text-[11px]">
                            <span className="capitalize">
                              {add.name} ({add.unit_name === "area" ? `${sqft}sqft × ₹${add.price}` : add.unit_name === "percentage" ? `${add.price}%` : `Flat ₹${add.price}`}):
                            </span> 
                            <span className="text-slate-800 font-bold">₹{add.calculatedAmount}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Subtotal */}
                    <div className="flex justify-between border-b border-slate-300 py-1.5 text-slate-900 font-extrabold text-xs">
                      <span>Subtotal:</span> <span>₹{subtotal}</span>
                    </div>

                    {/* Profit */}
                    <div className="flex justify-between border-b border-dashed pb-1">
                      <span>Profit ({pricingMap[activeTab].profit}%):</span> <span className="text-emerald-600 font-bold">+ ₹{profitAmount}</span>
                    </div>

                    {/* GST */}
                    <div className="flex justify-between border-b border-dashed pb-1">
                      <span>GST ({pricingMap[activeTab].gst}%):</span> <span className="text-indigo-600 font-bold">+ ₹{gstAmount}</span>
                    </div>
                  </div>

                  {/* Calculated Price */}
                  <div className="flex justify-between items-center bg-slate-50 border p-3 rounded-xl border-slate-200">
                    <span className="font-bold text-slate-700">Calculated Price:</span>
                    <strong className="text-lg text-slate-900 font-extrabold">₹{calculatedPrice}</strong>
                  </div>

                  {/* Final Price Input */}
                  <div className="flex flex-col gap-1 border-t pt-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Final Price (Editable)</span>
                    <input
                      type="number"
                      placeholder={rounded.toString()}
                      value={pricingMap[activeTab].selling_price || ""}
                      onChange={(e) => handleUpdateRateField(activeTab, "selling_price", parseFloat(e.target.value) || 0)}
                      className="h-10 border border-slate-300 rounded-lg px-3 text-sm focus:outline-none font-extrabold text-indigo-700 bg-white shadow-2xs"
                    />
                  </div>

                  {/* Final Price Summary Box */}
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3.5 flex items-center justify-between mt-1">
                    <div className="flex flex-col gap-0.5">
                      <strong className="text-indigo-900 text-xs font-extrabold">Final Price &rarr; {name}</strong>
                      <span className="text-[9px] text-indigo-600 font-bold">Round-up adj: +₹{rounded - calculatedPrice}</span>
                    </div>
                    <strong className="text-xl text-indigo-700 font-extrabold">₹{pricingMap[activeTab].selling_price || rounded}</strong>
                  </div>

                  <p className="text-[10px] text-slate-400 font-medium leading-tight">
                    Net profit after round-up: <strong className="text-slate-600">₹{Math.round(profitAmount + (rounded - calculatedPrice))}</strong> &middot; sent to accounts as final billed amount.
                  </p>
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800 capitalize">{name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700">Active</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-9 gap-3 text-xs font-semibold text-slate-500">
                    <div className="flex flex-col"><span>Area:</span><span className="text-slate-800 font-bold">{current.sqft} sqft</span></div>
                    <div className="flex flex-col"><span>Courier:</span><span className="text-slate-800 font-bold">₹{current.courier_price}</span></div>
                    <div className="flex flex-col"><span>Labour:</span><span className="text-slate-800 font-bold">₹{calculateRates(segmentId).labourCost}</span></div>
                    <div className="flex flex-col"><span>Advertisement:</span><span className="text-slate-800 font-bold">₹{calculateRates(segmentId).otherAdvCost}</span></div>
                    <div className="flex flex-col"><span>Additional:</span><span className="text-slate-800 font-bold">{(current.custom_fields || []).length} charges</span></div>
                    <div className="flex flex-col"><span>Subtotal:</span><span className="text-slate-800 font-bold">₹{subtotal}</span></div>
                    <div className="flex flex-col"><span>Profit:</span><span className="text-emerald-600 font-bold">₹{profitAmount}</span></div>
                    <div className="flex flex-col"><span>GST:</span><span className="text-indigo-600 font-bold">₹{gstAmount}</span></div>
                    <div className="flex flex-col"><span>Calculated:</span><strong className="text-indigo-700 font-bold">₹{calculatedPrice}</strong></div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end border-t pt-4 mt-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Round-off ending</span>
                      <select
                        value={roundOffMap[segmentId] || "x99"}
                        onChange={(e) => setRoundOffMap(prev => ({ ...prev, [segmentId]: e.target.value as any }))}
                        className="h-10 border border-slate-200 rounded-lg px-3 bg-white text-xs font-bold focus:outline-none shadow-sm cursor-pointer"
                      >
                        <option value="x99">x99</option>
                        <option value="x95">x95</option>
                      </select>
                    </div>

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
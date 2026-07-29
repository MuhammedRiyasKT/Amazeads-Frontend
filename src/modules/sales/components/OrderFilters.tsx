"use client";

import React, { useEffect, useState } from "react";
import { Search, Filter } from "lucide-react";
import { getDeliveryTypes, getSalesPriceCategories } from "../services/order.service";
import { DeliveryType, SalesPriceCategory } from "../types";

interface OrderFiltersProps {
  mobileSearch: string;
  setMobileSearch: (val: string) => void;
  orderStatus: string;
  setOrderStatus: (val: string) => void;
  paymentStatus: string;
  setPaymentStatus: (val: string) => void;
  fromDate: string;
  setFromDate: (val: string) => void;
  toDate: string;
  setToDate: (val: string) => void;
  deliveryTypeId: string;
  setDeliveryTypeId: (val: string) => void;
  priceCategoryId: string;
  setPriceCategoryId: (val: string) => void;
  onApply: () => void;
  onClear: () => void;
}

export default function OrderFilters({
  mobileSearch, setMobileSearch,
  orderStatus, setOrderStatus,
  paymentStatus, setPaymentStatus,
  fromDate, setFromDate,
  toDate, setToDate,
  deliveryTypeId, setDeliveryTypeId,
  priceCategoryId, setPriceCategoryId,
  onApply, onClear
}: OrderFiltersProps) {
  const [deliveryTypes, setDeliveryTypes] = useState<DeliveryType[]>([]);
  const [priceCategories, setPriceCategories] = useState<SalesPriceCategory[]>([]);

  useEffect(() => {
    getDeliveryTypes().then(setDeliveryTypes).catch(console.error);
    getSalesPriceCategories().then(setPriceCategories).catch(console.error);
  }, []);

  return (
    <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm flex flex-col gap-4">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Mobile Search */}
        <div className="relative">
          <input
            type="number"
            placeholder="Mobile No..."
            value={mobileSearch}
            onChange={(e) => setMobileSearch(e.target.value)}
            className="w-full h-10 border border-slate-200 rounded-lg pl-9 pr-3 text-xs focus:outline-none"
          />
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
        </div>

        {/* Order Status */}
        <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)} className="h-10 border border-slate-200 rounded-lg px-2 bg-white text-xs font-semibold focus:outline-none cursor-pointer">
          <option value="">Order Status</option>
          <option value="Confirmed">Confirmed</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        {/* Payment Status */}
        <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="h-10 border border-slate-200 rounded-lg px-2 bg-white text-xs font-semibold focus:outline-none cursor-pointer">
          <option value="">Payment Status</option>
          <option value="Pending">Pending</option>
          <option value="Partial">Partial</option>
          <option value="Paid">Paid</option>
        </select>

        {/* From Date */}
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="h-10 border border-slate-200 rounded-lg px-3 text-xs focus:outline-none" />

        {/* To Date */}
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="h-10 border border-slate-200 rounded-lg px-3 text-xs focus:outline-none" />

        {/* Delivery Type */}
        <select value={deliveryTypeId} onChange={(e) => setDeliveryTypeId(e.target.value)} className="h-10 border border-slate-200 rounded-lg px-2 bg-white text-xs font-semibold focus:outline-none cursor-pointer">
          <option value="">Delivery Type</option>
          {deliveryTypes.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>

        {/* Price Category */}
        <select value={priceCategoryId} onChange={(e) => setPriceCategoryId(e.target.value)} className="h-10 border border-slate-200 rounded-lg px-2 bg-white text-xs font-semibold focus:outline-none cursor-pointer">
          <option value="">Price Category</option>
          {priceCategories.map(p => <option key={p.id} value={p.id}>{p.price_category_name}</option>)}
        </select>
      </div>

      <div className="flex justify-end gap-2.5 border-t pt-3">
        <button onClick={onClear} className="px-4 py-2 border rounded-lg hover:bg-slate-50 text-xs font-bold cursor-pointer">
          Clear Filters
        </button>
        <button onClick={onApply} className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-sm">
          <Filter size={12} /> Apply Filters
        </button>
      </div>
    </div>
  );
}
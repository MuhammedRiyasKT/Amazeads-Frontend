"use client";

import React, { useState } from "react";
import styles from "./CreateOrderComponents.module.css";

interface CustomerScheduleFormProps {
  mobileSearch: string;
  setMobileSearch: (val: string) => void;
  customerName: string;
  setCustomerName: (val: string) => void;
  whatsappNumber: string;
  setWhatsappNumber: (val: string) => void;
  sameAsMobile: boolean;
  setSameAsMobile: (val: boolean) => void;

  billingAddress: string;
  setBillingAddress: (val: string) => void;
  billingDistrict: string;
  setBillingDistrict: (val: string) => void;
  billingState: string;
  setBillingState: (val: string) => void;
  billingPincode: string;
  setBillingPincode: (val: string) => void;
  billingCountry: string;
  setBillingCountry: (val: string) => void;

  deliveryAddress: string;
  setDeliveryAddress: (val: string) => void;
  deliveryDistrict: string;
  setDeliveryDistrict: (val: string) => void;
  deliveryState: string;
  setDeliveryState: (val: string) => void;
  deliveryPincode: string;
  setDeliveryPincode: (val: string) => void;
  deliveryCountry: string;
  setDeliveryCountry: (val: string) => void;

  sameAsBilling: boolean;
  setSameAsBilling: (val: boolean) => void;

  deliveryTypeId: number;
  setDeliveryTypeId: (val: number) => void;
  priceCategoryId: number;
  setPriceCategoryId: (val: number) => void;
  commitDate: string;
  setCommitDate: (val: string) => void;
  disableCommitDate?: boolean;
  completionDate?: string;
  setCompletionDate?: (val: string) => void;
  hideCompletionDate?: boolean; // 🌟 Hide completion date for quotations
  orderType: string;
  setOrderType: (val: string) => void;
  customers: Array<{ id: number; mobile_number: string }>;
  deliveryTypes: any[];
  priceCategories: any[];
  onSelectCustomer: (id: number) => Promise<void>;
}

export default function CustomerScheduleForm({
  mobileSearch, setMobileSearch,
  customerName, setCustomerName,
  whatsappNumber, setWhatsappNumber,
  sameAsMobile, setSameAsMobile,

  billingAddress, setBillingAddress,
  billingDistrict, setBillingDistrict,
  billingState, setBillingState,
  billingPincode, setBillingPincode,
  billingCountry, setBillingCountry,

  deliveryAddress, setDeliveryAddress,
  deliveryDistrict, setDeliveryDistrict,
  deliveryState, setDeliveryState,
  deliveryPincode, setDeliveryPincode,
  deliveryCountry, setDeliveryCountry,

  sameAsBilling, setSameAsBilling,

  deliveryTypeId, setDeliveryTypeId,
  priceCategoryId, setPriceCategoryId,
  commitDate, setCommitDate,
  disableCommitDate = false,
  completionDate = "",
  setCompletionDate,
  hideCompletionDate = false,
  orderType, setOrderType,
  customers,
  deliveryTypes,
  priceCategories,
  onSelectCustomer
}: CustomerScheduleFormProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const todayStr = getTodayString();

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs w-full box-border">
      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 flex flex-col justify-between h-full gap-3">

          {/* Row 1: Mobile, Customer Name, WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full shrink-0">
            {/* Mobile with Autocomplete */}
            <div className="relative flex flex-col gap-1">
              <div className="text-[10px] font-bold text-transparent select-none h-4 hidden sm:block">
                SPACER
              </div>
              <input
                type="number"
                placeholder="Mobile (+91...)"
                value={mobileSearch}
                onChange={(e) => { setMobileSearch(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                className="h-9 w-full border border-slate-200 rounded-lg px-3 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 bg-white"
              />
              {showSuggestions && mobileSearch && mobileSearch.length >= 4 && (
                <div className="absolute top-14 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl z-[200] max-h-44 overflow-y-auto p-1">
                  {customers.filter(c => String(c.mobile_number || "").includes(mobileSearch)).map((cust) => (
                    <div
                      key={cust.id}
                      className="px-3 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50 rounded-md cursor-pointer"
                      onClick={() => {
                        onSelectCustomer(cust.id);
                        setShowSuggestions(false);
                      }}
                    >
                      {cust.mobile_number}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Name */}
            <div className="flex flex-col gap-1">
              <div className="text-[10px] font-bold text-transparent select-none h-4 hidden sm:block">
                SPACER
              </div>
              <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="h-9 w-full border border-slate-200 rounded-lg px-3 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 bg-white"
                required
              />
            </div>

            {/* WhatsApp + Same as Mobile Checkbox */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-start h-4">
                <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sameAsMobile}
                    onChange={(e) => setSameAsMobile(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-3 w-3"
                  />
                  <span>Same as Mobile</span>
                </label>
              </div>
              <input
                type="number"
                placeholder="Whatsapp (+91...)"
                value={whatsappNumber}
                onChange={(e) => !sameAsMobile && setWhatsappNumber(e.target.value)}
                disabled={sameAsMobile}
                className={`h-9 w-full border border-slate-200 rounded-lg px-3 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 ${sameAsMobile ? "bg-slate-50 text-slate-500" : "bg-white"
                  }`}
              />
            </div>
          </div>

          {/* Row 2: Billing & Shipping Address Textareas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full flex-1 min-h-[105px]">
            <div className="flex flex-col gap-1 h-full">
              <div className="text-[10px] font-bold text-transparent select-none h-4 hidden sm:block">
                SPACER
              </div>
              <textarea
                placeholder="Billing Address"
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                className="w-full h-full border border-slate-200 rounded-lg p-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 bg-white min-h-[85px] resize-y"
              />
            </div>

            <div className="flex flex-col gap-1 h-full">
              <div className="flex items-center justify-start h-4">
                <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sameAsBilling}
                    onChange={(e) => setSameAsBilling(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-3 w-3"
                  />
                  <span>Same as Billing Address</span>
                </label>
              </div>
              <textarea
                placeholder="Shipping Address"
                value={deliveryAddress}
                onChange={(e) => !sameAsBilling && setDeliveryAddress(e.target.value)}
                disabled={sameAsBilling}
                className={`w-full h-full border border-slate-200 rounded-lg p-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 min-h-[85px] resize-y ${sameAsBilling ? "bg-slate-50 text-slate-500" : "bg-white"
                  }`}
              />
            </div>
          </div>

          {/* Row 3: City, State, Country, Pincode Sub-Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full shrink-0">
            {/* Billing Location Inputs */}
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="DISTRICT"
                value={billingDistrict}
                onChange={(e) => setBillingDistrict(e.target.value)}
                className="h-8 border border-slate-200 rounded-md px-2.5 text-xs font-bold uppercase text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 bg-white"
              />
              <input
                type="text"
                placeholder="STATE"
                value={billingState}
                onChange={(e) => setBillingState(e.target.value)}
                className="h-8 border border-slate-200 rounded-md px-2.5 text-xs font-bold uppercase text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 bg-white"
              />
              <input
                type="text"
                placeholder="PINCODE"
                value={billingPincode}
                onChange={(e) => setBillingPincode(e.target.value)}
                className="h-8 border border-slate-200 rounded-md px-2.5 text-xs font-bold uppercase text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 bg-white"
              />
              <input
                type="text"
                placeholder="COUNTRY"
                value={billingCountry}
                onChange={(e) => setBillingCountry(e.target.value)}
                className="h-8 border border-slate-200 rounded-md px-2.5 text-xs font-bold uppercase text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 bg-white"
              />
            </div>

            {/* Shipping Location Inputs */}
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="DISTRICT"
                value={deliveryDistrict}
                onChange={(e) => !sameAsBilling && setDeliveryDistrict(e.target.value)}
                disabled={sameAsBilling}
                className={`h-8 border border-slate-200 rounded-md px-2.5 text-xs font-bold uppercase text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 ${sameAsBilling ? "bg-slate-50 text-slate-500" : "bg-white"
                  }`}
              />
              <input
                type="text"
                placeholder="STATE"
                value={deliveryState}
                onChange={(e) => !sameAsBilling && setDeliveryState(e.target.value)}
                disabled={sameAsBilling}
                className={`h-8 border border-slate-200 rounded-md px-2.5 text-xs font-bold uppercase text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 ${sameAsBilling ? "bg-slate-50 text-slate-500" : "bg-white"
                  }`}
              />
              <input
                type="text"
                placeholder="PINCODE"
                value={deliveryPincode}
                onChange={(e) => !sameAsBilling && setDeliveryPincode(e.target.value)}
                disabled={sameAsBilling}
                className={`h-8 border border-slate-200 rounded-md px-2.5 text-xs font-bold uppercase text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 ${sameAsBilling ? "bg-slate-50 text-slate-500" : "bg-white"
                  }`}
              />
              <input
                type="text"
                placeholder="COUNTRY"
                value={deliveryCountry}
                onChange={(e) => !sameAsBilling && setDeliveryCountry(e.target.value)}
                disabled={sameAsBilling}
                className={`h-8 border border-slate-200 rounded-md px-2.5 text-xs font-bold uppercase text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 ${sameAsBilling ? "bg-slate-50 text-slate-500" : "bg-white"
                  }`}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 flex flex-col justify-between h-full gap-3 pt-2 lg:pt-0">

          <div className="flex flex-col gap-2.5 text-xs font-semibold text-slate-600">
            {/* Commit Date */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 whitespace-nowrap">
                COMMIT DATE
              </span>
              <input
                type="date"
                value={commitDate}
                disabled={disableCommitDate}
                {...(!disableCommitDate ? { min: todayStr, max: todayStr } : {})}
                onChange={(e) => {
                  if (disableCommitDate) return;
                  const val = e.target.value;
                  if (val && val !== todayStr) {
                    alert("Commit Date can only be today!");
                    setCommitDate(todayStr);
                  } else {
                    setCommitDate(val);
                  }
                }}
                className={`h-9 w-48 border border-slate-200 rounded-lg px-3 text-xs font-bold shrink-0 text-center ${
                  disableCommitDate
                    ? "bg-slate-100 text-slate-500 cursor-not-allowed border-slate-300"
                    : "bg-white text-slate-800 cursor-pointer focus:outline-none"
                }`}
              />
            </div>

            {/* Completion Date (Hidden if hideCompletionDate is true) */}
            {!hideCompletionDate && setCompletionDate && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 whitespace-nowrap">
                  COMPLETION DATE
                </span>
                <input
                  type="date"
                  value={completionDate}
                  onChange={(e) => {
                    const newCompletionDate = e.target.value;
                    if (commitDate && newCompletionDate && new Date(newCompletionDate) < new Date(commitDate)) {
                      alert("Completion date cannot be before Commit date (order date)!");
                      setCompletionDate(commitDate);
                    } else {
                      setCompletionDate(newCompletionDate);
                    }
                  }}
                  className="h-9 w-48 border border-slate-200 rounded-lg px-3 text-xs font-bold text-slate-800 focus:outline-none bg-white cursor-pointer shrink-0 text-center"
                />
              </div>
            )}

            {/* Order Type */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 whitespace-nowrap">
                ORDER TYPE
              </span>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="h-9 w-48 border border-slate-200 rounded-lg px-3 bg-white text-xs font-bold text-slate-800 focus:outline-none cursor-pointer shrink-0 text-center"
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
            </div>

            {/* Delivery Type */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 whitespace-nowrap">
                DELIVERY TYPE
              </span>
              <select
                value={deliveryTypeId}
                onChange={(e) => setDeliveryTypeId(parseInt(e.target.value))}
                className="h-9 w-48 border border-slate-200 rounded-lg px-3 bg-white text-xs font-bold text-slate-800 focus:outline-none cursor-pointer capitalize shrink-0 text-center"
              >
                {deliveryTypes.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>

          {/* Customer Category Pills */}
          <div className="bg-indigo-50/60 p-1.5 rounded-xl border border-indigo-100 flex items-center justify-between gap-1 mt-auto h-10 box-border">
            {priceCategories.map((cat) => {
              const isSelected = priceCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setPriceCategoryId(cat.id)}
                  className={`flex-1 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${isSelected
                    ? "bg-[#0047ab] text-white shadow-xs"
                    : "text-slate-700 hover:bg-indigo-100/60"
                    }`}
                >
                  {cat.price_category_name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
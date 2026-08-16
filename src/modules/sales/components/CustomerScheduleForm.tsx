"use client";

import React, { useState } from "react";

interface CustomerScheduleFormProps {
  mobileSearch: string;
  setMobileSearch: (val: string) => void;
  customerName: string;
  setCustomerName: (val: string) => void;
  whatsappNumber: string;
  setWhatsappNumber: (val: string) => void;
  customerAddress: string;
  setCustomerAddress: (val: string) => void;
  deliveryAddress: string;
  setDeliveryAddress: (val: string) => void;
  pincode: string;
  setPincode: (val: string) => void;
  city: string;
  setCity: (val: string) => void;
  state: string;
  setState: (val: string) => void;
  country: string;
  setCountry: (val: string) => void;
  deliveryTypeId: number;
  setDeliveryTypeId: (val: number) => void;
  priceCategoryId: number;
  setPriceCategoryId: (val: number) => void;
  accountId: number;
  setAccountId: (val: number) => void;
  commitDate: string;
  setCommitDate: (val: string) => void;
  completionDate: string;
  setCompletionDate: (val: string) => void;
  orderType: string;
  setOrderType: (val: string) => void;
  customers: Array<{ id: number; mobile_number: string }>;
  deliveryTypes: any[];
  priceCategories: any[];
  accounts: any[];
  onSelectCustomer: (id: number) => Promise<void>;
}

export default function CustomerScheduleForm({
  mobileSearch, setMobileSearch,
  customerName, setCustomerName,
  whatsappNumber, setWhatsappNumber,
  customerAddress, setCustomerAddress,
  deliveryAddress, setDeliveryAddress,
  pincode, setPincode,
  city, setCity,
  state, setState,
  country, setCountry,
  deliveryTypeId, setDeliveryTypeId,
  priceCategoryId, setPriceCategoryId,
  accountId, setAccountId,
  commitDate, setCommitDate,
  completionDate, setCompletionDate,
  orderType, setOrderType,
  customers,
  deliveryTypes,
  priceCategories,
  accounts,
  onSelectCustomer
}: CustomerScheduleFormProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs w-full box-border">
      
      {/* Main Split Layout: Left 8 Columns & Right 4 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch">
        
        {/* 🌟 LEFT COLUMN (CUSTOMER & ADDRESS DETAILS) */}
        <div className="lg:col-span-8 flex flex-col justify-between h-full gap-3">
          
          {/* Row 1: Mobile, Customer Name, WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full shrink-0">
            {/* Mobile with Autocomplete */}
            <div className="relative flex flex-col gap-1">
              <input
                type="number"
                placeholder="Mobile (+91...)"
                value={mobileSearch}
                onChange={(e) => { setMobileSearch(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                className="h-9 w-full border border-slate-200 rounded-lg px-3 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 bg-white"
              />
              {showSuggestions && mobileSearch && mobileSearch.length >= 4 && (
                <div className="absolute top-10 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl z-[200] max-h-44 overflow-y-auto p-1">
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
              <input 
                type="text" 
                placeholder="Customer Name" 
                value={customerName} 
                onChange={(e) => setCustomerName(e.target.value)} 
                className="h-9 w-full border border-slate-200 rounded-lg px-3 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 bg-white" 
                required 
              />
            </div>

            {/* WhatsApp */}
            <div className="flex flex-col gap-1">
              <input 
                type="number" 
                placeholder="Whatsapp (+91...)" 
                value={whatsappNumber} 
                onChange={(e) => setWhatsappNumber(e.target.value)} 
                className="h-9 w-full border border-slate-200 rounded-lg px-3 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 bg-white" 
              />
            </div>
          </div>

          {/* Row 2: Billing & Shipping Address Textareas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full flex-1 min-h-[110px]">
            <div className="flex flex-col h-full">
              <textarea
                placeholder="Billing Address"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full h-full border border-slate-200 rounded-lg p-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 bg-white min-h-[105px] resize-y"
              />
            </div>

            <div className="flex flex-col h-full">
              <textarea
                placeholder="Shipping Address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full h-full border border-slate-200 rounded-lg p-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 bg-white min-h-[105px] resize-y"
              />
            </div>
          </div>

          {/* 🌟 Row 3: City, State, Country, Pincode Sub-Grid (4 Fields Each) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full h-10 items-center shrink-0">
            {/* Billing Location Inputs (4 Fields) */}
            <div className="grid grid-cols-4 gap-1.5 h-full items-center">
              <input
                type="text"
                placeholder="CITY"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-8 border border-slate-200 rounded-md px-2 text-[11px] font-bold uppercase text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 bg-white"
              />
              <input
                type="text"
                placeholder="STATE"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="h-8 border border-slate-200 rounded-md px-2 text-[11px] font-bold uppercase text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 bg-white"
              />
              <input
                type="text"
                placeholder="COUNTRY"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="h-8 border border-slate-200 rounded-md px-2 text-[11px] font-bold uppercase text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 bg-white"
              />
              <input
                type="text"
                placeholder="PINCODE"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="h-8 border border-slate-200 rounded-md px-2 text-[11px] font-bold uppercase text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 bg-white"
              />
            </div>

            {/* Shipping Location Inputs (4 Fields) */}
            <div className="grid grid-cols-4 gap-1.5 h-full items-center">
              <input
                type="text"
                placeholder="CITY"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-8 border border-slate-200 rounded-md px-2 text-[11px] font-bold uppercase text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 bg-white"
              />
              <input
                type="text"
                placeholder="STATE"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="h-8 border border-slate-200 rounded-md px-2 text-[11px] font-bold uppercase text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 bg-white"
              />
              <input
                type="text"
                placeholder="COUNTRY"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="h-8 border border-slate-200 rounded-md px-2 text-[11px] font-bold uppercase text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 bg-white"
              />
              <input
                type="text"
                placeholder="PINCODE"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="h-8 border border-slate-200 rounded-md px-2 text-[11px] font-bold uppercase text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 bg-white"
              />
            </div>
          </div>
        </div>

        {/* 🌟 RIGHT COLUMN (DATES, ORDER TYPES & CATEGORY PILLS) */}
        <div className="lg:col-span-4 flex flex-col justify-between h-full gap-3 pt-2 lg:pt-0">
          
          {/* Dates & Order Type Details */}
          <div className="flex flex-col gap-2.5 text-xs font-semibold text-slate-600">
            {/* Commit Date */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 whitespace-nowrap">
                COMMIT DATE
              </span>
              <input 
                type="date" 
                value={commitDate} 
                onChange={(e) => {
                  const newCommitDate = e.target.value;
                  if (completionDate && newCommitDate && new Date(completionDate) < new Date(newCommitDate)) {
                    alert("Commit date (order date) cannot be after Completion date!");
                    setCommitDate(newCommitDate);
                    setCompletionDate(newCommitDate);
                  } else {
                    setCommitDate(newCommitDate);
                  }
                }} 
                className="h-9 w-48 border border-slate-200 rounded-lg px-3 text-xs font-bold text-slate-800 focus:outline-none bg-white cursor-pointer shrink-0 text-center" 
              />
            </div>

            {/* Completion Date */}
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

          {/* Customer Category Buttons (B2B, B2C, Wholesale Pills) */}
          <div className="bg-indigo-50/60 p-1 rounded-xl border border-indigo-100 flex items-center justify-between gap-1 mt-auto h-10 box-border">
            {priceCategories.map((cat) => {
              const isSelected = priceCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setPriceCategoryId(cat.id)}
                  className={`flex-1 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    isSelected
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
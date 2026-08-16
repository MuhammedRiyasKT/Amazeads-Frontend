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
    <div className={styles.card}>
      {/* Card Section Title */}
      

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
                className={styles.input}
              />
              {showSuggestions && mobileSearch && mobileSearch.length >= 4 && (
                <div className={styles.autocomplete}>
                  {customers.filter(c => String(c.mobile_number || "").includes(mobileSearch)).map((cust) => (
                    <div
                      key={cust.id}
                      className={styles.autoItem}
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
                className={styles.input} 
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
                className={styles.input} 
              />
            </div>
          </div>

          {/* Row 2: Billing & Shipping Address Textareas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full flex-1 min-h-[90px]">
            <div className="flex flex-col h-full">
              <textarea
                placeholder="Billing Address"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className={styles.textarea}
                rows={3}
                style={{ minHeight: "80px" }}
              />
            </div>

            <div className="flex flex-col h-full">
              <textarea
                placeholder="Shipping Address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className={styles.textarea}
                rows={3}
                style={{ minHeight: "80px" }}
              />
            </div>
          </div>

          {/* Row 3: City, State, Pincode, Country (2x2 Grid per Address) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full shrink-0">
            {/* Billing Location Inputs */}
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="CITY"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={styles.input}
                style={{ height: "32px", fontSize: "0.78rem" }}
              />
              <input
                type="text"
                placeholder="STATE"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className={styles.input}
                style={{ height: "32px", fontSize: "0.78rem" }}
              />
              <input
                type="text"
                placeholder="PINCODE"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className={styles.input}
                style={{ height: "32px", fontSize: "0.78rem" }}
              />
              <input
                type="text"
                placeholder="COUNTRY"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={styles.input}
                style={{ height: "32px", fontSize: "0.78rem" }}
              />
            </div>

            {/* Shipping Location Inputs */}
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="CITY"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={styles.input}
                style={{ height: "32px", fontSize: "0.78rem" }}
              />
              <input
                type="text"
                placeholder="STATE"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className={styles.input}
                style={{ height: "32px", fontSize: "0.78rem" }}
              />
              <input
                type="text"
                placeholder="PINCODE"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className={styles.input}
                style={{ height: "32px", fontSize: "0.78rem" }}
              />
              <input
                type="text"
                placeholder="COUNTRY"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={styles.input}
                style={{ height: "32px", fontSize: "0.78rem" }}
              />
            </div>
          </div>
        </div>

        {/* 🌟 RIGHT COLUMN (DATES, ORDER TYPES & CATEGORY PILLS) */}
        <div className="lg:col-span-4 flex flex-col justify-between h-full gap-3 pt-2 lg:pt-0">
          
          {/* Dates & Order Type Details */}
          <div className="flex flex-col gap-2.5">
            {/* Commit Date */}
            <div className="flex items-center justify-between gap-3">
              <span className={styles.label} style={{ whiteSpace: "nowrap" }}>
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
                className={styles.input} 
                style={{ width: "190px", textAlign: "center", cursor: "pointer" }}
              />
            </div>

            {/* Completion Date */}
            <div className="flex items-center justify-between gap-3">
              <span className={styles.label} style={{ whiteSpace: "nowrap" }}>
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
                className={styles.input} 
                style={{ width: "190px", textAlign: "center", cursor: "pointer" }}
              />
            </div>

            {/* Order Type */}
            <div className="flex items-center justify-between gap-3">
              <span className={styles.label} style={{ whiteSpace: "nowrap" }}>
                ORDER TYPE
              </span>
              <select 
                value={orderType} 
                onChange={(e) => setOrderType(e.target.value)} 
                className={styles.select} 
                style={{ width: "190px", textAlign: "center", cursor: "pointer" }}
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
            </div>

            {/* Delivery Type */}
            <div className="flex items-center justify-between gap-3">
              <span className={styles.label} style={{ whiteSpace: "nowrap" }}>
                DELIVERY TYPE
              </span>
              <select 
                value={deliveryTypeId} 
                onChange={(e) => setDeliveryTypeId(parseInt(e.target.value))} 
                className={styles.select} 
                style={{ width: "190px", textAlign: "center", cursor: "pointer", textTransform: "capitalize" }}
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
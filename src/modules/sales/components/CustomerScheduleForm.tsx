"use client";

import React, { useState } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import styles from "./CreateOrderComponents.module.css";

const WhatsAppIcon = ({ className = "w-3.5 h-3.5 text-emerald-500 shrink-0" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 2A10 10 0 0 0 2 12c0 1.77.462 3.498 1.336 5.023L2 22l5.127-1.328A9.957 9.957 0 0 0 12 22a10 10 0 0 0 0-20zm0 18c-1.656 0-3.238-.445-4.619-1.262l-.331-.197-3.041.788.802-2.955-.216-.344A7.954 7.954 0 0 1 4 12a8 8 0 1 1 8 8z"/>
  </svg>
);



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

export const formatE164 = (val?: string): string => {
  if (!val) return "";
  const cleaned = val.trim();
  if (cleaned.startsWith("+")) return cleaned;
  const digits = cleaned.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return `+91${digits}`;
};

export const getCountryName = (countryCode?: string): string => {
  if (!countryCode) return "";
  try {
    const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
    return regionNames.of(countryCode.toUpperCase()) || countryCode;
  } catch (e) {
    return countryCode;
  }
};

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
      <style dangerouslySetInnerHTML={{
        __html: `
        .phone-input-custom-container {
          display: flex;
          align-items: center;
          width: 100%;
          height: 36px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background-color: #ffffff;
          padding: 0 10px;
          transition: all 0.15s ease;
          box-sizing: border-box;
        }
        .phone-input-custom-container:focus-within {
          border-color: #4f46e5;
          box-shadow: 0 0 0 1px #4f46e5;
        }
        .phone-input-custom-container.phone-input-disabled {
          background-color: #f8fafc;
          color: #64748b;
        }
        .PhoneInputCountry {
          display: flex;
          align-items: center;
          margin-right: 6px;
          position: relative;
          shrink: 0;
        }
        .PhoneInputCountrySelect {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          z-index: 1;
          border: 0;
          opacity: 0;
          cursor: pointer;
        }
        .PhoneInputCountryIcon {
          width: 20px;
          height: 14px;
          border-radius: 2px;
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          margin-right: 4px;
        }
        .PhoneInputCountryIconImg {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .PhoneInputCountrySelectArrow {
          display: block;
          width: 5px;
          height: 5px;
          margin-left: 3px;
          margin-right: 4px;
          border-style: solid;
          border-color: #64748b;
          border-width: 0 1.5px 1.5px 0;
          transform: rotate(45deg);
          opacity: 0.7;
        }
        .PhoneInputInput {
          flex: 1;
          min-width: 0;
          background: transparent;
          border: none;
          outline: none;
          font-size: 0.75rem;
          font-weight: 700;
          color: #1e293b;
          height: 100%;
          padding-left: 4px;
        }
        .PhoneInputInput::placeholder {
          color: #94a3b8;
          font-weight: 500;
        }
        .PhoneInputInput:disabled {
          color: #64748b;
          cursor: not-allowed;
        }
      `}} />

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 flex flex-col justify-between h-full gap-3">

          {/* Row 1: Mobile, Customer Name, WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full shrink-0">
            {/* Mobile with Autocomplete & International Phone Input */}
            <div className="relative flex flex-col gap-1">
              <div className="text-[10px] font-bold text-transparent select-none h-4 hidden sm:block">
                SPACER
              </div>
              <PhoneInput
                defaultCountry="IN"
                international
                withCountryCallingCode
                placeholder="Mobile (+91...)"
                value={formatE164(mobileSearch) || undefined}
                onCountryChange={(country) => {
                  if (country) {
                    const countryName = getCountryName(country);
                    if (countryName) {
                      setBillingCountry(countryName);
                      if (sameAsBilling || !deliveryCountry || deliveryCountry === billingCountry) {
                        setDeliveryCountry(countryName);
                      }
                    }
                  }
                }}
                onChange={(val) => {
                  const phoneStr = val || "";
                  setMobileSearch(phoneStr);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="phone-input-custom-container"
              />
              {(() => {
                const searchDigits = (mobileSearch || "").replace(/\D/g, "");
                const localSearchDigits = (searchDigits.startsWith("91") && searchDigits.length > 10)
                  ? searchDigits.slice(2)
                  : searchDigits;
                
                const filteredCustomers = customers.filter((c) => {
                  if (!mobileSearch) return false;
                  const custDigits = String(c.mobile_number || "").replace(/\D/g, "");
                  return (
                    (localSearchDigits.length >= 3 && custDigits.includes(localSearchDigits)) ||
                    (searchDigits.length >= 3 && custDigits.includes(searchDigits)) ||
                    String(c.mobile_number || "").includes(mobileSearch)
                  );
                });

                if (!showSuggestions || filteredCustomers.length === 0) return null;

                return (
                  <div className="absolute top-14 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl z-[200] max-h-44 overflow-y-auto p-1">
                    {filteredCustomers.map((cust) => (
                      <div
                        key={cust.id}
                        className="px-3 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50 rounded-md cursor-pointer flex justify-between items-center"
                        onClick={() => {
                          onSelectCustomer(cust.id);
                          setShowSuggestions(false);
                        }}
                      >
                        <span>{cust.mobile_number}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
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

            {/* WhatsApp + Same as Mobile Checkbox + WhatsApp Icon */}
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
              <div className="relative flex items-center w-full">
                <div className="absolute left-2.5 flex items-center justify-center pointer-events-none z-10">
                  <WhatsAppIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                </div>
                <input
                  type="text"
                  placeholder="WhatsApp (+91...)"
                  value={whatsappNumber}
                  onChange={(e) => !sameAsMobile && setWhatsappNumber(e.target.value)}
                  disabled={sameAsMobile}
                  className={`h-9 w-full border border-slate-200 rounded-lg pl-8 pr-3 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 ${
                    sameAsMobile ? "bg-slate-50 text-slate-500" : "bg-white"
                  }`}
                />
              </div>
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
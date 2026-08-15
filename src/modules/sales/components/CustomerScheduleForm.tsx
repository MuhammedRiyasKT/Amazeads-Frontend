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
      <div className={styles.cardHeader}>
        <span className={styles.sectionTitle}>CUSTOMER & SCHEDULE</span>
      </div>
      <div className={styles.grid}>

        {/* Row 1: Customer Details & Account */}
        <div className={styles.col} style={{ position: "relative" }}>
          <label className={styles.label}>MOBILE</label>
          <input
            type="number"
            placeholder="Mobile (+91...)"
            value={mobileSearch}
            onChange={(e) => { setMobileSearch(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            className={styles.input}
          />
          {showSuggestions && mobileSearch && mobileSearch.length >= 4 && (
            <div className={styles.autocomplete} style={{ top: "62px" }}>
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

        <div className={styles.col}>
          <label className={styles.label}>CUSTOMER NAME</label>
          <input type="text" placeholder="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={styles.input} required />
        </div>

        <div className={styles.col}>
          <label className={styles.label}>WHATSAPP</label>
          <input type="number" placeholder="WhatsApp (+91...)" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} className={styles.input} />
        </div>

        <div className={styles.col}>
          <label className={styles.label}>CUSTOMER CATEGORY</label>
          <select value={priceCategoryId} onChange={(e) => setPriceCategoryId(parseInt(e.target.value))} className={styles.select}>
            {priceCategories.map(p => <option key={p.id} value={p.id}>{p.price_category_name}</option>)}
          </select>
        </div>

        {/* Row 2: Address & Location details */}
        <div className={styles.col}>
          <label className={styles.label}>CUSTOMER ADDRESS</label>
          <input type="text" placeholder="Customer Address" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className={styles.input} />
        </div>
        <div className={styles.col}>
          <label className={styles.label}>DELIVERY ADDRESS</label>
          <input type="text" placeholder="Delivery Address" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} className={styles.input} />
        </div>
        <div className={styles.col}>
          <label className={styles.label}>PINCODE</label>
          <input type="text" placeholder="PINCODE" value={pincode} onChange={(e) => setPincode(e.target.value)} className={styles.input} />
        </div>
        <div className={styles.col}>
          <label className={styles.label}>CITY</label>
          <input type="text" placeholder="Kochi" value={city} onChange={(e) => setCity(e.target.value)} className={styles.input} />
        </div>
        <div className={styles.col}>
          <label className={styles.label}>STATE</label>
          <input type="text" placeholder="Kerala" value={state} onChange={(e) => setState(e.target.value)} className={styles.input} />
        </div>

        {/* Row 3: Shipping & Dates scheduling */}
        <div className={styles.col}>
          <label className={styles.label}>COUNTRY</label>
          <input type="text" placeholder="India" value={country} onChange={(e) => setCountry(e.target.value)} className={styles.input} />
        </div>
        <div className={styles.col}>
          <label className={styles.label}>DELIVERY TYPE</label>
          <select value={deliveryTypeId} onChange={(e) => setDeliveryTypeId(parseInt(e.target.value))} className={styles.select}>
            {deliveryTypes.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className={styles.col}>
          <label className={styles.label}>ORDER TYPE</label>
          <select value={orderType} onChange={(e) => setOrderType(e.target.value)} className={styles.select}>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
          </select>
        </div>
        <div className={styles.col}>
          <label className={styles.label}>COMMIT DATE (ORDER DATE)</label>
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
          />
        </div>
        <div className={styles.col}>
          <label className={styles.label}>COMPLETION DATE</label>
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
          />
        </div>
      </div>
    </div>
  );
}
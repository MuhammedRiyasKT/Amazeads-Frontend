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
  deliveryTypeId: number;
  setDeliveryTypeId: (val: number) => void;
  priceCategoryId: number;
  setPriceCategoryId: (val: number) => void;
  commitDate: string;
  setCommitDate: (val: string) => void;
  designDate: string;
  setDesignDate: (val: string) => void;
  printDate: string;
  setPrintDate: (val: string) => void;
  completionDate: string;
  setCompletionDate: (val: string) => void;
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
  customerAddress, setCustomerAddress,
  deliveryAddress, setDeliveryAddress,
  pincode, setPincode,
  deliveryTypeId, setDeliveryTypeId,
  priceCategoryId, setPriceCategoryId,
  commitDate, setCommitDate,
  designDate, setDesignDate,
  printDate, setPrintDate,
  completionDate, setCompletionDate,
  orderType, setOrderType,
  customers,
  deliveryTypes,
  priceCategories,
  onSelectCustomer
}: CustomerScheduleFormProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.sectionTitle}>CUSTOMER & SCHEDULE</span>
      </div>
      <div className={styles.grid}>
        
        {/* Row 1 - MOBILE ആദ്യം സെറ്റ് ചെയ്തു 🌟 */}
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
          {showSuggestions && mobileSearch && (
            <div className={styles.autocomplete} style={{ top: "62px" }}>
              {customers.filter(c => c.mobile_number.includes(mobileSearch)).map((cust) => (
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

        <div className={`${styles.col} ${styles.col3}`}>
          <label className={styles.label}>CUSTOMER NAME</label>
          <input type="text" placeholder="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={styles.input} required />
        </div>

        <div className={styles.col}>
          <label className={styles.label}>WHATSAPP</label>
          <input type="number" placeholder="WhatsApp (+91...)" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} className={styles.input} />
        </div>

        {/* Row 2 */}
        <div className={`${styles.col} ${styles.col2}`}>
          <label className={styles.label}>CUSTOMER ADDRESS</label>
          <input type="text" placeholder="Customer Address" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className={styles.input} />
        </div>
        <div className={`${styles.col} ${styles.col2}`}>
          <label className={styles.label}>DELIVERY ADDRESS</label>
          <input type="text" placeholder="Delivery Address" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} className={styles.input} />
        </div>
        <div className={styles.col}>
          <label className={styles.label}>PINCODE</label>
          <input type="text" placeholder="PINCODE" value={pincode} onChange={(e) => setPincode(e.target.value)} className={styles.input} />
        </div>
        <div className={styles.col}>
          <label className={styles.label}>DELIVERY TYPE</label>
          <select value={deliveryTypeId} onChange={(e) => setDeliveryTypeId(parseInt(e.target.value))} className={styles.select}>
            {deliveryTypes.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        {/* Row 3 */}
        <div className={styles.col}>
          <label className={styles.label}>COMMIT DATE</label>
          <input type="date" value={commitDate} onChange={(e) => setCommitDate(e.target.value)} className={styles.input} />
        </div>
        <div className={styles.col}>
          <label className={styles.label}>DESIGN DATE</label>
          <input type="date" value={designDate} onChange={(e) => setDesignDate(e.target.value)} className={styles.input} />
        </div>
        <div className={styles.col}>
          <label className={styles.label}>PRINT DATE</label>
          <input type="date" value={printDate} onChange={(e) => setPrintDate(e.target.value)} className={styles.input} />
        </div>
        <div className={styles.col}>
          <label className={styles.label}>COMPLETION DATE</label>
          <input type="date" value={completionDate} onChange={(e) => setCompletionDate(e.target.value)} className={styles.input} />
        </div>
        <div className={styles.col}>
          <label className={styles.label}>ORDER TYPE</label>
          <select value={orderType} onChange={(e) => setOrderType(e.target.value)} className={styles.select}>
            <option value="Normal">Normal</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>
        <div className={styles.col}>
          <label className={styles.label}>CUSTOMER CATEGORY</label>
          <select value={priceCategoryId} onChange={(e) => setPriceCategoryId(parseInt(e.target.value))} className={styles.select}>
            {priceCategories.map(p => <option key={p.id} value={p.id}>{p.price_category_name}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
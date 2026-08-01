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
  commitDate: string;
  setCommitDate: (val: string) => void;
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
  city, setCity,
  state, setState,
  country, setCountry,
  deliveryTypeId, setDeliveryTypeId,
  priceCategoryId, setPriceCategoryId,
  commitDate, setCommitDate,
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
        
        {/* Row 1 */}
        <div className={`${styles.col} ${styles.col2}`} style={{ position: "relative" }}>
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

        <div className={`${styles.col} ${styles.col2}`}>
          <label className={styles.label}>CUSTOMER NAME</label>
          <input type="text" placeholder="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={styles.input} required />
        </div>

        <div className={`${styles.col} ${styles.col2}`}>
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

        {/* Row 2.5 */}
        <div className={`${styles.col} ${styles.col2}`}>
          <label className={styles.label}>CITY</label>
          <input type="text" placeholder="Kochi" value={city} onChange={(e) => setCity(e.target.value)} className={styles.input} />
        </div>
        <div className={`${styles.col} ${styles.col2}`}>
          <label className={styles.label}>STATE</label>
          <input type="text" placeholder="Kerala" value={state} onChange={(e) => setState(e.target.value)} className={styles.input} />
        </div>
        <div className={`${styles.col} ${styles.col2}`}>
          <label className={styles.label}>COUNTRY</label>
          <input type="text" placeholder="India" value={country} onChange={(e) => setCountry(e.target.value)} className={styles.input} />
        </div>

        {/* Row 3 (കോമൺ ആയിരുന്ന ഡിസൈൻ/പ്രിന്റ് ഡേറ്റുകൾ ഇവിടെ നിന്നും പൂർണ്ണമായി ഒഴിവാക്കി) 🌟 */}
        <div className={styles.col} style={{ gridColumn: "span 2" }}>
          <label className={styles.label}>COMMIT DATE (ORDER DATE)</label>
          <input type="date" value={commitDate} onChange={(e) => setCommitDate(e.target.value)} className={styles.input} />
        </div>
        <div className={styles.col} style={{ gridColumn: "span 2" }}>
          <label className={styles.label}>COMPLETION DATE</label>
          <input type="date" value={completionDate} onChange={(e) => setCompletionDate(e.target.value)} className={styles.input} />
        </div>
        <div className={styles.col}>
          <label className={styles.label}>ORDER TYPE</label>
          <select value={orderType} onChange={(e) => setOrderType(e.target.value)} className={styles.select}>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
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
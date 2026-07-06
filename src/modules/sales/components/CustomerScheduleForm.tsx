"use client";

import React from "react";
import styles from "./CreateOrderComponents.module.css";

export default function CustomerScheduleForm() {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.sectionTitle}>CUSTOMER & SCHEDULE</span>
      </div>
      <div className={styles.grid}>
        {/* Row 1 */}
        <div className={`${styles.col} ${styles.col3}`}>
          <label className={styles.label}>CUSTOMER NAME</label>
          <input type="text" placeholder="Customer Name" className={styles.input} />
        </div>
        <div className={styles.col}>
          <label className={styles.label}>MOBILE</label>
          <input type="text" placeholder="Mobile (+91...)" className={styles.input} />
        </div>
        <div className={styles.col}>
          <label className={styles.label}>WHATSAPP</label>
          <input type="text" placeholder="WhatsApp (+91...)" className={styles.input} />
        </div>

        {/* Row 2 */}
        <div className={`${styles.col} ${styles.col2}`}>
          <label className={styles.label}>CUSTOMER ADDRESS</label>
          <input type="text" placeholder="Customer Address" className={styles.input} />
        </div>
        <div className={`${styles.col} ${styles.col2}`}>
          <label className={styles.label}>DELIVERY ADDRESS</label>
          <input type="text" placeholder="Delivery Address" className={styles.input} />
        </div>
        <div className={styles.col}>
          <label className={styles.label}>PINCODE</label>
          <input type="text" placeholder="PINCODE" className={styles.input} />
        </div>
        <div className={styles.col}>
          <label className={styles.label}>DELIVERY TYPE</label>
          <select className={styles.select}>
            <option>Delivery Type</option>
            <option>Courier</option>
            <option>Direct Pickup</option>
          </select>
        </div>

        {/* Row 3 */}
        <div className={styles.col}>
          <label className={styles.label}>COMMIT DATE</label>
          <input type="date" className={styles.input} />
        </div>
        <div className={styles.col}>
          <label className={styles.label}>DESIGN DATE</label>
          <input type="date" className={styles.input} />
        </div>
        <div className={styles.col}>
          <label className={styles.label}>PRINT DATE</label>
          <input type="date" className={styles.input} />
        </div>
        <div className={styles.col}>
          <label className={styles.label}>COMPLETION DATE</label>
          <input type="date" className={styles.input} />
        </div>
        <div className={styles.col}>
          <label className={styles.label}>ORDER TYPE</label>
          <select className={styles.select}>
            <option>Order Type</option>
            <option>Urgent</option>
            <option>Normal</option>
          </select>
        </div>
        <div className={styles.col}>
          <label className={styles.label}>CUSTOMER CATEGORY</label>
          <select className={styles.select}>
            <option>B2B</option>
            <option>B2C</option>
          </select>
        </div>
      </div>
    </div>
  );
}
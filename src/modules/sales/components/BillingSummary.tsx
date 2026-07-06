"use client";

import React from "react";
import styles from "./CreateOrderComponents.module.css";

interface BillingSummaryProps {
  tableTotal: number;
  discount: number;
  onDiscountChange: (val: number) => void;
  paidAmount: number;
  onPaidAmountChange: (val: number) => void;
}

export default function BillingSummary({
  tableTotal,
  discount,
  onDiscountChange,
  paidAmount,
  onPaidAmountChange,
}: BillingSummaryProps) {
  const finalAmount = tableTotal - discount;
  const balanceDue = finalAmount - paidAmount;

  return (
    <div className={styles.bottomGrid}>
      <div className={styles.notesCard}>
        <div className={styles.col}>
          <label className={styles.label}>PAYMENT STATUS</label>
          <select className={styles.select}>
            <option>Payment Status</option>
            <option>Pending</option>
            <option>Partial</option>
            <option>Completed</option>
          </select>
        </div>
        <div className={styles.col} style={{ marginTop: "16px" }}>
          <label className={styles.label}>ORDER NOTES</label>
          <textarea placeholder="Order Notes" className={styles.textarea} rows={4} />
        </div>
      </div>

      <div className={styles.billingCard}>
        <div className={styles.billRow}>
          <span>Sub Total</span>
          <strong>₹{tableTotal.toLocaleString("en-IN")}.00</strong>
        </div>
        <div className={styles.billRow}>
          <span>Discount (₹)</span>
          <input
            type="number"
            className={styles.billInput}
            value={discount || ""}
            onChange={(e) => onDiscountChange(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className={`${styles.billRow} ${styles.borderTop}`}>
          <span>Final Amount</span>
          <strong>₹{finalAmount.toLocaleString("en-IN")}.00</strong>
        </div>
        <div className={styles.billRow}>
          <span>Paid Amount (₹)</span>
          <input
            type="number"
            className={styles.billInput}
            value={paidAmount || ""}
            onChange={(e) => onPaidAmountChange(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className={`${styles.billRow} ${styles.balanceRow}`}>
          <span>BALANCE DUE</span>
          <strong>₹{balanceDue.toLocaleString("en-IN")}.00</strong>
        </div>
      </div>
    </div>
  );
}
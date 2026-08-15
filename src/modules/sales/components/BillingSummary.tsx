// src/modules/sales/components/BillingSummary.tsx

"use client";

import React from "react";
import styles from "./CreateOrderComponents.module.css";

interface BillingSummaryProps {
  tableTotal: number;
  discount: number;
  onDiscountChange: (val: number) => void;
  paidAmount: number;
  onPaidAmountChange: (val: number) => void;
  paymentStatus: string;
  onPaymentStatusChange: (val: string) => void;
  remarks: string;
  onRemarksChange: (val: string) => void;
  paymentType: string;
  onPaymentTypeChange: (val: string) => void;
  accountId: number;
  onAccountIdChange: (val: number) => void;
  accounts: any[];
}

export default function BillingSummary({
  tableTotal,
  discount,
  onDiscountChange,
  paidAmount,
  onPaidAmountChange,
  paymentStatus,
  onPaymentStatusChange,
  remarks,
  onRemarksChange,
  paymentType,
  onPaymentTypeChange,
  accountId,
  onAccountIdChange,
  accounts,
}: BillingSummaryProps) {
  const finalAmount = tableTotal - discount;
  const balanceDue = finalAmount - paidAmount;

  return (
    <div className={styles.bottomGrid}>
      <div className={styles.notesCard}>
        {/* Dropdowns Row */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
          <div style={{ flex: 1 }}>
            <select
              value={paymentType}
              onChange={(e) => onPaymentTypeChange(e.target.value)}
              className={styles.select}
              style={{ cursor: "pointer" }}
            >
              <option value="">Payment Type</option>
              <option value="Cash">💰 Cash</option>
              <option value="Credit/Debit Card">💳 Credit/Debit Card</option>
              <option value="UPI">📱 UPI</option>
              <option value="Bank Transfer">🏦 Bank Transfer</option>
              <option value="Cheque">📄 Cheque</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <select
              value={accountId}
              onChange={(e) => onAccountIdChange(parseInt(e.target.value))}
              className={styles.select}
              style={{ cursor: "pointer" }}
            >
              <option value={0}>Select Account</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.account_name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <select
              value={paymentStatus}
              onChange={(e) => onPaymentStatusChange(e.target.value)}
              className={styles.select}
              style={{ cursor: "pointer" }}
            >
              <option value="Pending">Pending</option>
              <option value="Partial">Partial</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
        </div>

        {/* Textarea */}
        <div>
          <textarea
            placeholder="Order Note / Special instructions..."
            value={remarks}
            onChange={(e) => onRemarksChange(e.target.value)}
            className={styles.textarea}
            rows={5}
          />
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
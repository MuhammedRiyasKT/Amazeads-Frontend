"use client";

import React, { useEffect } from "react";
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
  const finalAmount = Math.max(0, tableTotal - discount);
  const balanceDue = Math.max(0, finalAmount - paidAmount);

  // Detect selected account details
  const selectedAccount = accounts.find((a) => a.id === accountId);
  const isCashAccount = (selectedAccount?.account_name || "").toLowerCase().includes("cash");

  // Account change rule for Payment Type
  useEffect(() => {
    if (isCashAccount) {
      onPaymentTypeChange("Cash");
    } else if (paymentType === "Cash") {
      onPaymentTypeChange("");
    }
  }, [accountId, isCashAccount]);

  // Auto-derive Payment Status from paidAmount vs finalAmount
  useEffect(() => {
    if (paidAmount === 0) {
      onPaymentStatusChange("Not Paid");
    } else if (paidAmount >= finalAmount && finalAmount > 0) {
      onPaymentStatusChange("Paid");
    } else {
      onPaymentStatusChange("Partial");
    }
  }, [paidAmount, finalAmount]);

  return (
    <div className={styles.bottomGrid}>
      <div className={styles.notesCard}>
        {/* Dropdowns Row */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>

          {/* Account Selection */}
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

          {/* Payment Type Selection */}
          <div style={{ flex: 1 }}>
            <select
              value={paymentType}
              onChange={(e) => onPaymentTypeChange(e.target.value)}
              className={styles.select}
              style={{ cursor: "pointer" }}
            >
              <option value="">Payment Type</option>
              {isCashAccount ? (
                <option value="Cash">💰 Cash</option>
              ) : (
                <>
                  <option value="Credit/Debit Card">💳 Credit/Debit Card</option>
                  <option value="UPI">📱 UPI</option>
                  <option value="Bank Transfer">🏦 Bank Transfer</option>
                  <option value="Cheque">📄 Cheque</option>
                </>
              )}
            </select>
          </div>

          {/* Payment Status — auto-derived from Paid Amount */}
          <div style={{ flex: 1 }}>
            <select
              value={paymentStatus}
              disabled
              className={styles.select}
              style={{ cursor: "not-allowed", opacity: 0.75 }}
            >
              <option value="Not Paid">Not Paid</option>
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
            min="0"
            max={tableTotal}
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
            min="0"
            max={finalAmount}
            className={styles.billInput}
            value={paidAmount || ""}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0;
              if (val > finalAmount) {
                alert(`Paid amount cannot be greater than Final Amount (₹${finalAmount})`);
                onPaidAmountChange(finalAmount);
              } else {
                onPaidAmountChange(val);
              }
            }}
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
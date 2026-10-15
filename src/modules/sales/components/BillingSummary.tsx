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
  disableAccount?: boolean;
  enablePaymentTypeEdit?: boolean;
  readOnly?: boolean;
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
  disableAccount = false,
  enablePaymentTypeEdit = false,
  readOnly = false,
}: BillingSummaryProps) {
  const finalAmount = Math.max(0, tableTotal - discount);
  const balanceDue = Math.max(0, finalAmount - paidAmount);

  // Detect selected account details
  const selectedAccount = accounts.find((a) => a.id === accountId);
  const isCashAccount = (selectedAccount?.account_name || "").toLowerCase().includes("cash");

  // Account change rule for Payment Type
  useEffect(() => {
    if (readOnly) return;
    if (!accounts || accounts.length === 0) return;

    if (isCashAccount) {
      if (paymentType !== "Cash") {
        onPaymentTypeChange("Cash");
      }
    } else if (paymentType === "Cash" && !disableAccount) {
      onPaymentTypeChange("");
    }
  }, [accountId, isCashAccount, accounts.length, disableAccount, readOnly]);

  // Auto-derive Payment Status from paidAmount vs finalAmount
  useEffect(() => {
    if (readOnly) return;
    if (paidAmount === 0) {
      onPaymentStatusChange("Not Paid");
    } else if (paidAmount >= finalAmount && finalAmount > 0) {
      onPaymentStatusChange("Paid");
    } else {
      onPaymentStatusChange("Partial");
    }
  }, [paidAmount, finalAmount, readOnly]);

  const isPaymentDisabled = paymentStatus === "Partial" || paymentStatus === "Paid";
  const isAccountDisabled = readOnly || disableAccount || isPaymentDisabled;
  const isPaymentTypeDisabled = readOnly ? true : (enablePaymentTypeEdit ? false : isPaymentDisabled);

  return (
    <div className={styles.bottomGrid}>
      <div className={styles.notesCard}>
        {/* Dropdowns Row */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>

          {/* Account Selection */}
          <div style={{ flex: 1 }}>
            <select
              value={accountId}
              onChange={(e) => {
                if (readOnly) return;
                onAccountIdChange(parseInt(e.target.value));
              }}
              disabled={isAccountDisabled}
              className={styles.select}
              style={{
                cursor: isAccountDisabled ? "not-allowed" : "pointer",
                opacity: isAccountDisabled ? 0.75 : 1,
                backgroundColor: isAccountDisabled ? "#f8fafc" : "white",
              }}
              title={
                readOnly
                  ? "Account cannot be changed when editing an order"
                  : disableAccount
                  ? "Account cannot be changed when editing an existing order"
                  : undefined
              }
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
              onChange={(e) => {
                if (readOnly) return;
                onPaymentTypeChange(e.target.value);
              }}
              disabled={isPaymentTypeDisabled}
              className={styles.select}
              style={{
                cursor: isPaymentTypeDisabled ? "not-allowed" : "pointer",
                opacity: isPaymentTypeDisabled ? 0.75 : 1,
                backgroundColor: isPaymentTypeDisabled ? "#f8fafc" : "white",
              }}
              title={readOnly ? "Payment Type cannot be changed when editing an order" : undefined}
            >
              <option value="">Payment Type</option>
              {isCashAccount && !readOnly ? (
                <option value="Cash">💰 Cash</option>
              ) : (
                <>
                  <option value="Credit/Debit Card">💳 Credit/Debit Card</option>
                  <option value="Card">💳 Card</option>
                  <option value="UPI">📱 UPI</option>
                  <option value="Bank Transfer">🏦 Bank Transfer</option>
                  <option value="Cheque">📄 Cheque</option>
                  <option value="Cash">💰 Cash</option>
                </>
              )}
              {paymentType && !["Cash", "UPI", "Credit/Debit Card", "Card", "Bank Transfer", "Cheque", ""].includes(paymentType) && (
                <option value={paymentType}>{paymentType}</option>
              )}
            </select>
          </div>

          {/* Payment Status — auto-derived from Paid Amount */}
          <div style={{ flex: 1 }}>
            <input
              type="text"
              value={paymentStatus}
              readOnly
              className={styles.select}
              style={{
                cursor: "not-allowed",
                opacity: 0.8,
                appearance: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                backgroundImage: "none",
                backgroundColor: "#f8fafc",
              }}
            />
          </div>
        </div>

        {/* Textarea */}
        <div>
          <textarea
            placeholder={readOnly ? "No remarks" : "Order Note / Special instructions..."}
            value={remarks}
            onChange={(e) => {
              if (readOnly) return;
              onRemarksChange(e.target.value);
            }}
            disabled={readOnly}
            readOnly={readOnly}
            className={styles.textarea}
            style={readOnly ? { backgroundColor: "#f8fafc", cursor: "not-allowed", opacity: 0.85 } : undefined}
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
            disabled={readOnly}
            readOnly={readOnly}
            style={readOnly ? { backgroundColor: "#f8fafc", cursor: "not-allowed", opacity: 0.85 } : undefined}
            onChange={(e) => {
              if (readOnly) return;
              onDiscountChange(parseFloat(e.target.value) || 0);
            }}
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
            disabled={readOnly}
            readOnly={readOnly}
            style={readOnly ? { backgroundColor: "#f8fafc", cursor: "not-allowed", opacity: 0.85 } : undefined}
            onChange={(e) => {
              if (readOnly) return;
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
"use client";

import React from "react";
import { Wallet } from "lucide-react";
import styles from "./AccountsComponents.module.css";

export default function BankAccountSummary() {
  const accounts = [
    { name: "HDFC Current A/c - 4099", balance: "₹18.45L", progress: 75, progressColor: styles.progressHdfc, sub: "Limit: ₹25L", subValue: "75% Capacity" },
    { name: "ICICI OD A/c - 1202", balance: "₹8.20L", progress: 40, progressColor: styles.progressIcici, sub: "", subValue: "" },
    { name: "SBI Saving A/c - 9911", balance: "₹4.15L", progress: 20, progressColor: styles.progressSbi, sub: "", subValue: "" },
  ];

  return (
    <div className={styles.boxCard}>
      <div className={styles.boxHeader}>
        <span className={styles.boxTitle}>Bank Account Summary</span>
        <a href="#" className={styles.seeAllLink}>View All</a>
      </div>

      <div className={styles.list} style={{ gap: "16px" }}>
        {accounts.map((acc) => (
          <div key={acc.name} className={styles.bankItem}>
            <div className={styles.bankHeaderRow}>
              <span className={styles.bankName}>{acc.name}</span>
              <strong className={styles.bankBalance}>{acc.balance}</strong>
            </div>

            <div className={styles.progressBarWrapper}>
              <div className={styles.progressBar}>
                <div className={`${styles.progressFill} ${acc.progressColor}`} style={{ width: `${acc.progress}%` }} />
              </div>
            </div>

            {acc.sub && (
              <div className={styles.bankSubRow}>
                <span>{acc.sub}</span>
                <span>{acc.subValue}</span>
              </div>
            )}
          </div>
        ))}

        {/* Petty Cash */}
        <div className={styles.pettyCashRow}>
          <div className="flex items-center gap-2">
            <Wallet size={16} className="text-slate-600" />
            <span className={styles.bankName} style={{ marginBottom: 0 }}>Petty Cash In-Hand</span>
          </div>
          <strong className={styles.bankBalance}>₹2.00L</strong>
        </div>
      </div>
    </div>
  );
}
"use client";

import React from "react";
import { Landmark, FileText, Activity, CreditCard, DollarSign } from "lucide-react";
import styles from "./AccountsComponents.module.css";

export default function AccountsKPIs() {
  const kpis = [
    { label: "REVENUE", value: "₹45,20,000", subtext: "Total Sales Value", extra: "+8.5%", icon: DollarSign, colorClass: styles.iconRevenue, isLive: false },
    { label: "COLLECTIONS", value: "₹18,50,000", subtext: "145 Payments Recv.", extra: null, icon: FileText, colorClass: styles.iconCollections, isLive: false },
    { label: "PENDING RECEIVABLES", value: "₹12,40,000", subtext: "32 Overdue Invoices", extra: null, icon: Activity, colorClass: styles.iconPending, isLive: true },
    { label: "EXPENSES", value: "₹22,10,000", subtext: "87 Total Entries", extra: null, icon: CreditCard, colorClass: styles.iconExpense, isLive: false },
    { label: "CASH & BANK BALANCE", value: "₹32,80,000", subtext: "Across all accounts", extra: null, icon: Landmark, colorClass: styles.iconBalance, isLive: true },
  ];

  return (
    <div className={styles.kpiGrid}>
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div key={kpi.label} className={styles.kpiCard}>
            <div className={styles.kpiInfo}>
              <span className={styles.kpiLabel}>{kpi.label}</span>
              <strong className={styles.kpiValue}>{kpi.value}</strong>
              <span className={styles.kpiSubtext}>{kpi.subtext}</span>
            </div>
            <div className={styles.kpiRight}>
              {kpi.extra && <span className={styles.trendBadge}>{kpi.extra}</span>}
              {kpi.isLive && <span className={styles.liveBadge}><span className={styles.liveDot} /> LIVE</span>}
              <div className={`${styles.kpiIconWrapper} ${kpi.colorClass}`}>
                <Icon size={18} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
"use client";

import React from "react";
import { IndianRupee, ShoppingBag, Folder, Users, CreditCard } from "lucide-react";
import styles from "./AdminComponents.module.css";

export default function AdminKPIs() {
  const kpis = [
    { label: "REVENUE", value: "₹4,85,200", trend: "+12.3%", icon: IndianRupee, colorClass: styles.iconRevenue, trendClass: styles.trendUp },
    { label: "ORDERS", value: "148", trend: "+8.5%", icon: ShoppingBag, colorClass: styles.iconOrders, trendClass: styles.trendUp },
    { label: "PROJECT", value: "34", trend: "+4.2%", icon: Folder, colorClass: styles.iconProject, trendClass: styles.trendUp },
    { label: "ATTENDANCE", value: "94.5%", trend: "+3.7%", icon: Users, colorClass: styles.iconAttendance, trendClass: styles.trendUp },
    { label: "EXPENSE", value: "₹42,100", trend: "-2.1%", icon: CreditCard, colorClass: styles.iconExpense, trendClass: styles.trendDown },
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
              <span className={styles.kpiSubtext}>vs Dec 01 - Dec 30</span>
            </div>
            <div className={styles.kpiRight}>
              <span className={`${styles.trendBadge} ${kpi.trendClass}`}>{kpi.trend}</span>
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
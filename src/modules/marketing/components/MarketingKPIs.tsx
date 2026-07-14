"use client";

import React from "react";
import { Users, Flame, CheckCircle2, DollarSign } from "lucide-react";
import styles from "./MarketingComponents.module.css";

export default function MarketingKPIs() {
  const kpis = [
    { label: "TOTAL LEADS", value: "1,284 Leads", icon: Users, iconClass: styles.iconBlue },
    { label: "ACTIVE CAMPAIGNS", value: "8 Active", icon: Flame, iconClass: styles.iconOrange },
    { label: "CONVERTED TODAY", value: "42 Converted", icon: CheckCircle2, iconClass: styles.iconGreen },
    { label: "SPENT THIS MONTH", value: "₹42,100", icon: DollarSign, iconClass: styles.iconRed },
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
            </div>
            <div className={`${styles.kpiIconCircle} ${kpi.iconClass}`}>
              <Icon size={20} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
"use client";

import React from "react";
import { ShoppingCart, Folder, Landmark, CheckCircle } from "lucide-react";
import styles from "./ProjectManagerComponents.module.css";

export default function ManagerKPIs() {
  const kpis = [
    { label: "TOTAL SALE ORDER", value: "1,284", icon: ShoppingCart, iconClass: styles.iconBlue },
    { label: "TOTAL PROJECTS", value: "60", icon: Folder, iconClass: styles.iconGray },
    { label: "ACTIVE PROJECTS", value: "15", icon: Landmark, iconClass: styles.iconOrange },
    { label: "COMPLETED", value: "30", icon: CheckCircle, iconClass: styles.iconGreen },
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
            <div className={`${styles.kpiIconWrapper} ${kpi.iconClass}`}>
              <Icon size={20} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
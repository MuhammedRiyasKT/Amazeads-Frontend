"use client";

import React from "react";
import { Truck, Navigation, CheckCircle2, AlertTriangle } from "lucide-react";
import styles from "./LogisticsComponents.module.css";

export default function LogisticsKPIs() {
  const kpis = [
    { label: "TOTAL DISPATCHED", value: "348 Items", icon: Truck, iconClass: styles.iconBlue },
    { label: "IN TRANSIT", value: "45 Shipments", icon: Navigation, iconClass: styles.iconOrange },
    { label: "DELIVERED TODAY", value: "124 Packages", icon: CheckCircle2, iconClass: styles.iconGreen },
    { label: "PENDING COURIER", value: "12 Shipments", icon: AlertTriangle, iconClass: styles.iconRed },
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
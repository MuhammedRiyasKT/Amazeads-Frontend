"use client";

import React from "react";
import { Users, UserCheck, CalendarDays, Clock } from "lucide-react";
import styles from "./HRComponents.module.css";

export default function HRKPIs() {
  const kpis = [
    { label: "TOTAL EMPLOYEES", value: "48 Active", icon: Users, iconClass: styles.iconBlue },
    { label: "PRESENT TODAY", value: "44 Present", icon: UserCheck, iconClass: styles.iconGreen },
    { label: "ON LEAVE TODAY", value: "4 On Leave", icon: CalendarDays, iconClass: styles.iconOrange },
    { label: "LATE CHECK-IN", value: "2 Late", icon: Clock, iconClass: styles.iconRed },
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
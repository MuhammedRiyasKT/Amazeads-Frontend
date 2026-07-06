"use client";

import React from "react";
import { ShoppingCart, CreditCard, Wallet, AlertTriangle } from "lucide-react";

interface SalesKPIProps {
  styles: Record<string, string>;
}

export default function SalesKPI({ styles }: SalesKPIProps) {
  const kpis = [
    {
      label: "Total Sale Order",
      value: "1,284",
      subtext: "↑ 12% vs last month",
      trendClass: styles.trendUp,
      icon: ShoppingCart,
      iconClass: styles.iconBlue,
    },
    {
      label: "Total Sale Value",
      value: "₹ 42,85,900",
      subtext: "↑ 8.4% vs last month",
      trendClass: styles.trendUp,
      icon: CreditCard,
      iconClass: styles.iconSlate,
    },
    {
      label: "Cash Collection",
      value: "₹ 31,40,200",
      subtext: "73% recovery rate",
      trendClass: styles.trendNeutral,
      icon: Wallet,
      iconClass: styles.iconOrange,
    },
    {
      label: "Pending Balance",
      value: "₹ 11,45,700",
      subtext: "Attention Required",
      trendClass: styles.trendAlert,
      icon: AlertTriangle,
      iconClass: styles.iconRed,
    },
  ];

  return (
    <div className={styles.kpiGrid}>
      {kpis.map((kpi) => {
        const IconComponent = kpi.icon;
        return (
          <div key={kpi.label} className={styles.kpiCard}>
            <div className={styles.kpiInfo}>
              <span className={styles.kpiLabel}>{kpi.label}</span>
              <span className={styles.kpiValue}>{kpi.value}</span>
              <span className={`${styles.kpiSubtext} ${kpi.trendClass}`}>
                {kpi.subtext}
              </span>
            </div>
            <div className={`${styles.kpiIconWrapper} ${kpi.iconClass}`}>
              <IconComponent size={20} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
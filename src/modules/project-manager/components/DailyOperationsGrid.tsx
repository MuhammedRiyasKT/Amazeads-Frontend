"use client";

import React from "react";
import { ChevronRight, LayoutGrid, Truck, Scissors, Printer, Folder, CheckCircle, XCircle } from "lucide-react";
import styles from "./ProjectManagerComponents.module.css";

export default function DailyOperationsGrid() {
  const items = [
    { label: "Products to dispatch today", count: "12 items", icon: Truck, badgeClass: styles.badgeBlue, iconClass: styles.opsIconBlue },
    { label: "Products for design", count: "5 items", icon: Scissors, badgeClass: styles.badgeTeal, iconClass: styles.opsIconTeal },
    { label: "Products for print", count: "9 items", icon: Printer, badgeClass: styles.badgeRed, iconClass: styles.opsIconRed },
    { label: "Pending project", count: "3 projects", icon: Folder, badgeClass: styles.badgePurple, iconClass: styles.opsIconPurple },
    { label: "Completed", count: "2 items", icon: CheckCircle, badgeClass: styles.badgeGreen, iconClass: styles.opsIconGreen },
    { label: "Cancelled", count: "2 items", icon: XCircle, badgeClass: styles.badgeOrange, iconClass: styles.opsIconOrange },
  ];

  return (
    <div className={styles.boxCard}>
      <div className={styles.boxHeader}>
        <span className={styles.boxTitle}>Daily Operations</span>
        <LayoutGrid size={16} className={styles.boxHeaderIcon} />
      </div>

      <div className={styles.opsGrid}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className={styles.opsItem}>
              <div className={styles.opsLeft}>
                <div className={`${styles.opsIconWrapper} ${item.iconClass}`}>
                  <Icon size={20} />
                </div>
                <div className={styles.opsInfo}>
                  <span className={styles.opsLabel}>{item.label}</span>
                  <span className={`${styles.badgePill} ${item.badgeClass}`}>{item.count}</span>
                </div>
              </div>
              <ChevronRight size={16} className={styles.opsArrow} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
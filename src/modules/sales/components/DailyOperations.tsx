"use client";

import React from "react";
import { Truck, Scissors, Printer, Folder, CheckCircle2, XCircle, ChevronRight, Grid } from "lucide-react";

interface DailyOperationsProps {
  styles: Record<string, string>;
}

export default function DailyOperations({ styles }: DailyOperationsProps) {
  const operations = [
    {
      label: "Products to dispatch today",
      count: "12 items",
      badgeClass: styles.badgeBlue,
      icon: Truck,
      iconClass: styles.iconBlue,
    },
    {
      label: "Products for design",
      count: "5 items",
      badgeClass: styles.badgeTeal,
      icon: Scissors,
      iconClass: styles.iconBlue,
    },
    {
      label: "Products for print",
      count: "9 items",
      badgeClass: styles.badgeRed,
      icon: Printer,
      iconClass: styles.iconRed,
    },
    {
      label: "Pending project",
      count: "3 projects",
      badgeClass: styles.badgePurple,
      icon: Folder,
      iconClass: styles.iconSlate,
    },
    {
      label: "Completed",
      count: "2 items",
      badgeClass: styles.badgeGreen,
      icon: CheckCircle2,
      iconClass: styles.iconOrange,
    },
    {
      label: "Cancelled",
      count: "2 items",
      badgeClass: styles.badgeOrange,
      icon: XCircle,
      iconClass: styles.iconRed,
    },
  ];

  return (
    <div className={styles.sectionBox}>
      <div className={styles.boxHeader}>
        <h2 className={styles.boxTitle}>Daily Operations</h2>
        <Grid className={styles.boxIcon} size={18} />
      </div>

      <div className={styles.opsGrid}>
        {operations.map((op) => {
          const OpIcon = op.icon;

          let iconBgClass = styles.iconBlue;
          if (op.label.includes("design")) iconBgClass = "";
          else if (op.label.includes("print")) iconBgClass = styles.iconRed;
          else if (op.label.includes("project")) iconBgClass = "";
          else if (op.label.includes("Completed")) iconBgClass = "";
          else if (op.label.includes("Cancelled")) iconBgClass = "";

          const iconStyles: React.CSSProperties = {
            backgroundColor: op.label.includes("design")
              ? "#ccfbf1"
              : op.label.includes("Completed")
              ? "#dcfce7"
              : op.label.includes("Cancelled")
              ? "#ffedd5"
              : op.label.includes("project")
              ? "#f3e8ff"
              : undefined,
            color: op.label.includes("design")
              ? "#0f766e"
              : op.label.includes("Completed")
              ? "#15803d"
              : op.label.includes("Cancelled")
              ? "#c2410c"
              : op.label.includes("project")
              ? "#7e22ce"
              : undefined,
          };

          return (
            <div key={op.label} className={styles.opsCard}>
              <div
                className={`${styles.opsIcon} ${iconBgClass}`}
                style={iconStyles}
              >
                <OpIcon size={20} />
              </div>
              <div className={styles.opsInfo}>
                <span className={styles.opsLabel}>{op.label}</span>
                <span className={`${styles.badgePill} ${op.badgeClass}`}>
                  {op.count}
                </span>
              </div>
              <ChevronRight className={styles.opsArrow} size={16} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
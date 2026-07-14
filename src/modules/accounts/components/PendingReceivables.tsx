"use client";

import React from "react";
import { Building2 } from "lucide-react";
import styles from "./AccountsComponents.module.css";

export default function PendingReceivables() {
  const receivables = [
    { id: 1, name: "Apex Logistics", ref: "INV-2023-089", amount: "₹2,45,000", badge: "OVERDUE 12D", badgeClass: styles.badgeOutlineDanger },
    { id: 2, name: "Mega Corp", ref: "INV-2023-092", amount: "₹1,80,000", badge: "PENDING", badgeClass: styles.badgeSolidWarning },
  ];

  return (
    <div className={styles.boxCard}>
      <div className={styles.boxHeader}>
        <span className={styles.boxTitle}>Pending Receivables</span>
        <a href="#" className={styles.seeAllLink}>View All</a>
      </div>

      <div className={styles.list}>
        {receivables.map((rec) => (
          <div key={rec.id} className={styles.recItem}>
            <div className={styles.recLeft}>
              <div className={styles.recIcon}>
                <Building2 size={18} />
              </div>
              <div>
                <div className={styles.recName}>{rec.name}</div>
                <div className={styles.recRef}>{rec.ref}</div>
              </div>
            </div>
            <div className={styles.recRight}>
              <strong className={styles.recAmount}>{rec.amount}</strong>
              <span className={`${styles.checkBadge} ${rec.badgeClass}`}>{rec.badge}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
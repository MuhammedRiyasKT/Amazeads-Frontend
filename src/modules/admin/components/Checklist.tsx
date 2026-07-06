"use client";

import React from "react";
import { ListTodo, CheckCircle2 } from "lucide-react";
import styles from "./AdminComponents.module.css";

export default function Checklist() {
  const items = [
    { id: 1, text: "Vehicle insurance", detail: "(KL 29 x 9585)", badge: "12 DAYS LEFT", badgeClass: styles.badgeWarning, checked: false },
    { id: 2, text: "GST 3B Filing", detail: "", badge: "6 DAYS LEFT", badgeClass: styles.badgeDanger, checked: false },
    { id: 3, text: "Vendor payments batch", detail: "", badge: "CLEARED", badgeClass: styles.badgeSuccess, checked: true },
  ];

  return (
    <div className={styles.boxCard}>
      <div className={styles.boxHeader}>
        <span className={styles.boxTitle}>Checklist</span>
        <ListTodo size={16} className={styles.boxHeaderIcon} />
      </div>

      <div className={styles.list}>
        {items.map((item) => (
          <div key={item.id} className={styles.checkItem}>
            <div className={styles.checkLeft}>
              {item.checked ? (
                <CheckCircle2 size={18} className={styles.checkedIcon} />
              ) : (
                <div className={styles.uncheckedCircle} />
              )}
              <span className={`${styles.checkText} ${item.checked ? styles.lineThrough : ""}`}>
                {item.text} <span className={styles.checkDetail}>{item.detail}</span>
              </span>
            </div>
            <span className={`${styles.checkBadge} ${item.badgeClass}`}>{item.badge}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
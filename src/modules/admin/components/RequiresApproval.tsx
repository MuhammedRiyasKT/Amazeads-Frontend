"use client";

import React from "react";
import { Clock, Check, X, Calendar, FileText } from "lucide-react";
import styles from "./AdminComponents.module.css";

export default function RequiresApproval() {
  const approvals = [
    { id: 1, title: "Staff Leave Request", detail: "Neha Gupta • Project Manager - 202", icon: Calendar, iconClass: styles.approvalIconGreen },
    { id: 2, title: "Expense Reimbursement", detail: "Aryan Sharma • Amount - 409", icon: FileText, iconClass: styles.approvalIconBlue },
  ];

  return (
    <div className={styles.boxCard}>
      <div className={styles.boxHeader}>
        <span className={styles.boxTitle}>Requires Approval</span>
        <Clock size={16} className={styles.boxHeaderIcon} />
      </div>

      <div className={styles.list}>
        {approvals.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className={styles.listItem}>
              <div className={styles.listLeft}>
                <div className={`${styles.iconRounded} ${item.iconClass}`}>
                  <Icon size={18} />
                </div>
                <div className={styles.listInfo}>
                  <h4 className={styles.itemTitle}>{item.title}</h4>
                  <p className={styles.itemDetail}>{item.detail}</p>
                </div>
              </div>
              <div className={styles.listActions}>
                <button type="button" className={`${styles.actionBtn} ${styles.actionAccept}`}>
                  <Check size={16} />
                </button>
                <button type="button" className={`${styles.actionBtn} ${styles.actionReject}`}>
                  <X size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
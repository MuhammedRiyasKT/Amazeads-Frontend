"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import styles from "./StaffComponents.module.css";

interface StaffKPIsProps {
  totalStaff: number;
}

export default function StaffKPIs({ totalStaff }: StaffKPIsProps) {
  return (
    <div className={styles.kpiGrid}>
      {/* Total Staff */}
      <div className={`${styles.kpiCard} ${styles.kpiCardGray}`}>
        <div className={styles.kpiLabelRow}>
          <span className={styles.kpiLabel}>Total Staff</span>
        </div>
        <strong className={styles.kpiValue}>{totalStaff}</strong>
      </div>

      {/* Active (Purple theme) */}
      <div className={`${styles.kpiCard} ${styles.kpiCardPurple}`}>
        <div className={styles.kpiLabelRow}>
          <span className={styles.kpiLabelPurple}>Active</span>
          <CheckCircle2 size={18} className={styles.kpiCheckIcon} />
        </div>
        <strong className={styles.kpiValue}>{totalStaff > 0 ? totalStaff - 1 : 0}</strong>
      </div>

      {/* On Leave Today */}
      <div className={`${styles.kpiCard} ${styles.kpiCardOrange}`}>
        <div className={styles.kpiLabelRow}>
          <span className={styles.kpiLabel}>On Leave Today</span>
        </div>
        <strong className={styles.kpiValue}>1</strong>
      </div>

      {/* Departments */}
      <div className={`${styles.kpiCard} ${styles.kpiCardBlue}`}>
        <div className={styles.kpiLabelRow}>
          <span className={styles.kpiLabel}>Departments</span>
        </div>
        <strong className={styles.kpiValue}>6</strong>
      </div>
    </div>
  );
}
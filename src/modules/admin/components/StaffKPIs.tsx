"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import styles from "./StaffComponents.module.css";

interface StaffKPIsProps {
  totalStaff: number;
  activeCount: number;
  inactiveCount: number;
  deptCount: number;
}

export default function StaffKPIs({ totalStaff, activeCount, inactiveCount, deptCount }: StaffKPIsProps) {
  return (
    <div className={styles.kpiGrid}>
      {/* 1. Total Staff */}
      <div className={`${styles.kpiCard} ${styles.kpiCardGray}`}>
        <div className={styles.kpiLabelRow}>
          <span className={styles.kpiLabel}>Total Staff</span>
        </div>
        <strong className={styles.kpiValue}>{totalStaff}</strong>
      </div>

      {/* 2. Active (Purple theme) */}
      <div className={`${styles.kpiCard} ${styles.kpiCardPurple}`}>
        <div className={styles.kpiLabelRow}>
          <span className={styles.kpiLabelPurple}>Active</span>
          <CheckCircle2 size={18} className={styles.kpiCheckIcon} />
        </div>
        <strong className={styles.kpiValue}>{activeCount}</strong>
      </div>

      {/* 3. Inactive (Orange theme) */}
      <div className={`${styles.kpiCard} ${styles.kpiCardOrange}`}>
        <div className={styles.kpiLabelRow}>
          <span className={styles.kpiLabel}>Inactive</span>
        </div>
        <strong className={styles.kpiValue}>{inactiveCount}</strong>
      </div>

      {/* 4. Departments (Blue theme) */}
      <div className={`${styles.kpiCard} ${styles.kpiCardBlue}`}>
        <div className={styles.kpiLabelRow}>
          <span className={styles.kpiLabel}>Departments</span>
        </div>
        <strong className={styles.kpiValue}>{deptCount}</strong>
      </div>
    </div>
  );
}
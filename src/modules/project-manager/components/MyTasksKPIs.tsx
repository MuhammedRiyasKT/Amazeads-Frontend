"use client";

import React from "react";
import styles from "./MyTasksComponents.module.css";

interface MyTasksKPIsProps {
  total: number;
  inProgress: number;
}

export default function MyTasksKPIs({ total, inProgress }: MyTasksKPIsProps) {
  return (
    <div className={styles.kpiGrid}>
      <div className={`${styles.kpiCard} ${styles.kpiCardBlue}`}>
        <span className={styles.kpiLabel}>Assigned Tasks</span>
        <strong className={styles.kpiValue}>{total}</strong>
      </div>

      <div className={`${styles.kpiCard} ${styles.kpiCardOrange}`}>
        <div className={styles.kpiLabel}>In Progress</div>
        <strong className={styles.kpiValue}>{inProgress}</strong>
      </div>

      <div className={`${styles.kpiCard} ${styles.kpiCardGreen}`}>
        <div className={styles.kpiLabel}>Completed</div>
        <strong className={styles.kpiValue}>0</strong>
      </div>

      <div className={`${styles.kpiCard} ${styles.kpiCardPurple}`}>
        <div className={styles.kpiLabel}>Overdue</div>
        <strong className={styles.kpiValue}>0</strong>
      </div>
    </div>
  );
}
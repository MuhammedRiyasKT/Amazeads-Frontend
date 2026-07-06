"use client";

import React from "react";
import styles from "./TaskComponents.module.css";

interface TaskKPIsProps {
  total: number;
}

export default function TaskKPIs({ total }: TaskKPIsProps) {
  return (
    <div className={styles.kpiGrid}>
      <div className={`${styles.kpiCard} ${styles.kpiCardBlue}`}>
        <span className={styles.kpiLabel}>Total Tasks</span>
        <strong className={styles.kpiValue}>{total}</strong>
      </div>

      <div className={`${styles.kpiCard} ${styles.kpiCardOrange}`}>
        <div className={styles.kpiLabel}>Assigned Tasks</div>
        <strong className={styles.kpiValue}>{total > 0 ? total - 1 : 0}</strong>
      </div>

      <div className={`${styles.kpiCard} ${styles.kpiCardGreen}`}>
        <div className={styles.kpiLabel}>Completed Tasks</div>
        <strong className={styles.kpiValue}>0</strong>
      </div>

      <div className={`${styles.kpiCard} ${styles.kpiCardPurple}`}>
        <div className={styles.kpiLabel}>Departments</div>
        <strong className={styles.kpiValue}>6</strong>
      </div>
    </div>
  );
}
"use client";

import React from "react";
import { ListTodo, CheckCircle2, AlertCircle } from "lucide-react";
import styles from "./DailyTasksComponents.module.css";

interface MyTasksKPIsProps {
  total: number;
  completed: number;
  pending: number;
}

export default function MyTasksKPIs({ total, completed, pending }: MyTasksKPIsProps) {
  return (
    <div className={styles.kpiGrid}>
      {/* 1. Total Chores */}
      <div className={styles.kpiCard}>
        <div className={`${styles.kpiIconCircle} ${styles.iconBlue}`}>
          <ListTodo size={22} />
        </div>
        <div className={styles.kpiInfo}>
          <span className={styles.kpiLabel}>TOTAL CHORES</span>
          <strong className={styles.kpiValue}>{total} Tasks</strong>
        </div>
      </div>

      {/* 2. Completed */}
      <div className={styles.kpiCard}>
        <div className={`${styles.kpiIconCircle} ${styles.iconGreen}`}>
          <CheckCircle2 size={22} />
        </div>
        <div className={styles.kpiInfo}>
          <span className={styles.kpiLabel}>COMPLETED</span>
          <strong className={styles.kpiValue} style={{ color: "#0ca678" }}>{completed} Tasks</strong>
        </div>
      </div>

      {/* 3. Pending */}
      <div className={styles.kpiCard}>
        <div className={`${styles.kpiIconCircle} ${styles.iconRed}`}>
          <AlertCircle size={22} />
        </div>
        <div className={styles.kpiInfo}>
          <span className={styles.kpiLabel}>PENDING</span>
          <strong className={styles.kpiValue} style={{ color: "#c92a2a" }}>{pending} Tasks</strong>
        </div>
      </div>
    </div>
  );
}
"use client";

import React from "react";
import { MoreHorizontal, RotateCw, CheckCircle2 } from "lucide-react";
import styles from "./PrintingComponents.module.css";

export default function PrintingKPIs() {
  return (
    <div className={styles.kpiGrid}>
      <div className={`${styles.kpiCard} ${styles.kpiCardGray}`}>
        <span className={styles.kpiLabel}>TOTAL PRINT JOBS</span>
        <div className="flex justify-between items-baseline mt-2">
          <strong className={styles.kpiValue}>18</strong>
          <span className="text-xs font-semibold text-slate-500">Tasks</span>
        </div>
      </div>

      <div className={`${styles.kpiCard} ${styles.kpiCardBlue}`}>
        <span className={styles.kpiLabel}>QUEUED</span>
        <div className="flex justify-between items-center mt-2">
          <strong className={styles.kpiValue}>5</strong>
          <MoreHorizontal size={18} className="text-blue-500" />
        </div>
      </div>

      <div className={`${styles.kpiCard} ${styles.kpiCardOrange}`}>
        <span className={styles.kpiLabel}>IN PRODUCTION</span>
        <div className="flex justify-between items-center mt-2">
          <strong className={styles.kpiValue}>8</strong>
          <RotateCw size={18} className="text-orange-500" />
        </div>
      </div>

      <div className={`${styles.kpiCard} ${styles.kpiCardGreen}`}>
        <span className={styles.kpiLabel}>COMPLETED TODAY</span>
        <div className="flex justify-between items-center mt-2">
          <strong className={styles.kpiValue}>5</strong>
          <CheckCircle2 size={18} className="text-green-500" />
        </div>
      </div>
    </div>
  );
}
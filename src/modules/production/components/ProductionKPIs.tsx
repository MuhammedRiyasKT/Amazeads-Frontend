"use client";

import React from "react";
import { ClipboardList, Clock, Settings, CheckCircle2 } from "lucide-react";
import styles from "./ProductionComponents.module.css";

export default function ProductionKPIs() {
  return (
    <div className={styles.kpiGrid}>
      <div className={`${styles.kpiCard} ${styles.kpiCardGray}`}>
        <span className={styles.kpiLabel}>TOTAL PRODUCTION JOBS</span>
        <div className="flex justify-between items-baseline mt-2">
          <strong className={styles.kpiValue}>14 <span className="text-xs font-semibold text-slate-500">Tasks</span></strong>
        </div>
      </div>

      <div className={`${styles.kpiCard} ${styles.kpiCardOrange}`}>
        <span className={styles.kpiLabel}>QUEUED</span>
        <div className="flex justify-between items-center mt-2">
          <strong className={styles.kpiValue}>4</strong>
          <Clock size={18} className="text-orange-500" />
        </div>
      </div>

      <div className={`${styles.kpiCard} ${styles.kpiCardBlue}`}>
        <span className={styles.kpiLabel}>IN PRODUCTION</span>
        <div className="flex justify-between items-center mt-2">
          <strong className={styles.kpiValue}>7</strong>
          <Settings size={18} className="text-indigo-500 animate-spin-slow" />
        </div>
      </div>

      <div className={`${styles.kpiCard} ${styles.kpiCardGreen}`}>
        <span className={styles.kpiLabel}>COMPLETED TODAY</span>
        <div className="flex justify-between items-center mt-2">
          <strong className={styles.kpiValue}>3</strong>
          <CheckCircle2 size={18} className="text-green-500" />
        </div>
      </div>
    </div>
  );
}
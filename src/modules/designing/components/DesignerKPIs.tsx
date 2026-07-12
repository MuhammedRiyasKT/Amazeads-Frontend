"use client";

import React from "react";
import { ClipboardList, Clock, Settings, CheckCircle2 } from "lucide-react";
import styles from "./DesigningComponents.module.css";

export default function DesignerKPIs() {
  return (
    <div className={styles.kpiGrid}>
      <div className={`${styles.kpiCard} ${styles.kpiCardGray}`}>
        <div className={`${styles.kpiIconCircle} ${styles.iconPurple}`}>
          <ClipboardList size={20} />
        </div>
        <div className={styles.kpiInfo}>
          <span className={styles.kpiLabel}>TOTAL DESIGN JOBS</span>
          <strong className={styles.kpiValue}>
            18 <span className="text-xs font-semibold text-slate-500">Tasks</span>
          </strong>
        </div>
      </div>

      <div className={`${styles.kpiCard} ${styles.kpiCardGray}`}>
        <div className={`${styles.kpiIconCircle} ${styles.iconOrange}`}>
          <Clock size={20} />
        </div>
        <div className={styles.kpiInfo}>
          <span className={styles.kpiLabel}>QUEUED</span>
          <strong className={styles.kpiValue}>6</strong>
        </div>
      </div>

      <div className={`${styles.kpiCard} ${styles.kpiCardGray}`}>
        <div className={`${styles.kpiIconCircle} ${styles.iconGreen}`}>
          <Settings size={20} className="animate-spin-slow" />
        </div>
        <div className={styles.kpiInfo}>
          <span className={styles.kpiLabel}>IN DESIGN</span>
          <strong className={styles.kpiValue}>8</strong>
        </div>
      </div>

      <div className={`${styles.kpiCard} ${styles.kpiCardGray}`}>
        <div className={`${styles.kpiIconCircle} ${styles.iconTeal}`}>
          <CheckCircle2 size={20} />
        </div>
        <div className={styles.kpiInfo}>
          <span className={styles.kpiLabel}>COMPLETED TODAY</span>
          <strong className={styles.kpiValue}>4</strong>
        </div>
      </div>
    </div>
  );
}
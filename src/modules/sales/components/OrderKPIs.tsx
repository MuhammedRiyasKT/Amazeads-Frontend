"use client";

import React from "react";
import { CalendarRange, Clock, CheckCircle2 } from "lucide-react";
import styles from "./OrderListComponents.module.css";

interface OrderKPIsProps {
  totalCount: number;
  draftCount: number;
  confirmedCount: number;
}

export default function OrderKPIs({ totalCount, draftCount, confirmedCount }: OrderKPIsProps) {
  return (
    <div className={styles.kpiGrid}>
      <div className={styles.kpiCard}>
        <div className={`${styles.kpiIconWrapper} ${styles.iconBlue}`}><CalendarRange size={20} /></div>
        <div>
          <span className={styles.kpiLabel}>Total Orders</span>
          <strong className={styles.kpiValue}>{totalCount}</strong>
        </div>
      </div>
      <div className={styles.kpiCard}>
        <div className={`${styles.kpiIconWrapper} ${styles.iconAmber}`}><Clock size={20} /></div>
        <div>
          <span className={styles.kpiLabel}>Draft Orders</span>
          <strong className={styles.kpiValue}>{draftCount}</strong>
        </div>
      </div>
      <div className={styles.kpiCard}>
        <div className={`${styles.kpiIconWrapper} ${styles.iconGreen}`}><CheckCircle2 size={20} /></div>
        <div>
          <span className={styles.kpiLabel}>Confirmed Orders</span>
          <strong className={styles.kpiValue}>{confirmedCount}</strong>
        </div>
      </div>
    </div>
  );
}
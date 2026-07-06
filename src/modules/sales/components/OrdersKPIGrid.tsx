"use client";

import React from "react";
import { FileText, Calendar, CheckCircle2, AlertTriangle } from "lucide-react";
import styles from "./OrdersComponents.module.css";

export default function OrdersKPIGrid() {
  return (
    <div className={styles.kpiGrid}>
      <div className={styles.kpiCard}>
        <div>
          <div className={styles.kpiLabel}>ALL ORDERS</div>
          <div className={styles.kpiValue}>1,284</div>
          <div className={styles.kpiSubtext}>↑ 12% from last month</div>
        </div>
        <FileText size={18} className={styles.kpiIcon} />
      </div>

      <div className={styles.kpiCard}>
        <div>
          <div className={styles.kpiLabel}>TODAY'S ORDERS</div>
          <div className={styles.kpiValue}>42</div>
          <div className={styles.kpiSubtextMuted}>Updated 5 mins ago</div>
        </div>
        <Calendar size={18} className={styles.kpiIcon} />
      </div>

      <div className={styles.kpiCard}>
        <div>
          <div className={styles.kpiLabel}>CONVERTED ORDERS</div>
          <div className={styles.kpiValue}>89%</div>
          <div className={styles.kpiSubtext}>High performance</div>
        </div>
        <CheckCircle2 size={18} className={styles.kpiIcon} />
      </div>

      <div className={styles.kpiDangerCard}>
        <div>
          <div className={styles.kpiLabel}>PENDING CONVERSION</div>
          <div className={styles.kpiValue}>156</div>
          <div className={styles.kpiSubtextDanger}>Action required</div>
        </div>
        <AlertTriangle size={18} className={styles.kpiIconDanger} />
      </div>
    </div>
  );
}
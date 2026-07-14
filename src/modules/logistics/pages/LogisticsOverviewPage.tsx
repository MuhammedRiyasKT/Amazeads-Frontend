"use client";

import React from "react";
import { Calendar } from "lucide-react";
import LogisticsKPIs from "../components/LogisticsKPIs";
import ActiveDispatchTable from "../components/ActiveDispatchTable";
import LogisticsChecklist from "../components/LogisticsChecklist";
import styles from "../components/LogisticsComponents.module.css";

export default function LogisticsOverviewPage() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Logistics Control Center</h1>
          <p className={styles.subtitle}>Real-time dispatch monitoring, active transit logs, and carrier audits.</p>
        </div>
        <button type="button" className={styles.dateFilter}>
          <Calendar size={16} /> Jan 01 - Jan 30
        </button>
      </div>

      {/* KPIs Grid */}
      <LogisticsKPIs />

      {/* Main Contents Grid */}
      <div className={styles.mainGrid}>
        {/* Left Column (Active Dispatch List) */}
        <ActiveDispatchTable />

        {/* Right Column (Logistics Operations Checklist) */}
        <LogisticsChecklist />
      </div>
    </div>
  );
}
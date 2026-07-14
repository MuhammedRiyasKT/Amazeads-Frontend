"use client";

import React from "react";
import { Calendar } from "lucide-react";
import HRKPIs from "../components/HRKPIs";
import RecentLeavesTable from "../components/RecentLeavesTable";
import HRChecklist from "../components/HRChecklist";
import styles from "../components/HRComponents.module.css";

export default function HROverviewPage() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>HR Control Center</h1>
          <p className={styles.subtitle}>Real-time attendance logs, employee leave metrics, and onboarding audits.</p>
        </div>
        <button type="button" className={styles.dateFilter}>
          <Calendar size={16} /> Jan 01 - Jan 30
        </button>
      </div>

      {/* KPIs Grid */}
      <HRKPIs />

      {/* Main Contents Grid */}
      <div className={styles.mainGrid}>
        {/* Left Column (Recent Leaves Tracker) */}
        <RecentLeavesTable />

        {/* Right Column (HR Operations Checklist) */}
        <HRChecklist />
      </div>
    </div>
  );
}
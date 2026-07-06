"use client";

import React from "react";
import { Calendar } from "lucide-react";
import AdminKPIs from "../components/AdminKPIs";
import RequiresApproval from "../components/RequiresApproval";
import Checklist from "../components/Checklist";
import DailyOperationsGrid from "../components/DailyOperationsGrid";
import styles from "../components/AdminComponents.module.css";

export default function AdminPage() {
  return (
    <div className={styles.container}>
      {/* Header row */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>System Overview</h1>
          <p className={styles.subtitle}>Real-time enterprise performance metrics.</p>
        </div>
        <button type="button" className={styles.dateFilter}>
          <Calendar size={16} /> Jan 01 - Jan 30
        </button>
      </div>

      {/* KPIs Grid */}
      <AdminKPIs />

      {/* Main Contents Grid */}
      <div className={styles.mainGrid}>
        {/* Left Column (Approvals & Checklist) */}
        <div className={styles.leftCol}>
          <RequiresApproval />
          <Checklist />
        </div>

        {/* Right Column (Daily Operations) */}
        <DailyOperationsGrid />
      </div>
    </div>
  );
}
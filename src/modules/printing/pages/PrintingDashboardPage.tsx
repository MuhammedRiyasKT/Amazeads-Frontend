"use client";

import React from "react";
import PrintingKPIs from "../components/PrintingKPIs";
import QueueFilters from "../components/QueueFilters";
import QueueCardGrid from "../components/QueueCardGrid";
import styles from "../components/PrintingComponents.module.css";

export default function PrintingDashboardPage() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <div>
        <h1 className={styles.title}>Daily Printing Queue</h1>
        <p className={styles.subtitle}>Manage your upcoming and active print jobs.</p>
      </div>

      {/* KPIs Grid */}
      <PrintingKPIs />

      {/* Filters */}
      <QueueFilters />

      {/* Card Grid queue */}
      <QueueCardGrid />
    </div>
  );
}
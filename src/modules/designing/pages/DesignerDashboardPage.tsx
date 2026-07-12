"use client";

import React from "react";
import DesignerKPIs from "../components/DesignerKPIs";
import DesignQueueFilters from "../components/DesignQueueFilters";
import DesignCardGrid from "../components/DesignCardGrid";
import styles from "../components/DesigningComponents.module.css";

export default function DesignerDashboardPage() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <div>
        <h1 className={styles.title}>Daily Design Queue</h1>
        <p className={styles.subtitle}>Manage your upcoming and active design jobs.</p>
      </div>

      {/* KPIs Grid */}
      <DesignerKPIs />

      {/* Filters */}
      <DesignQueueFilters />

      {/* Card Grid queue */}
      <DesignCardGrid />
    </div>
  );
}
"use client";

import React from "react";
import { Calendar } from "lucide-react";
import ProjectManagerKPIs from "../components/ProjectManagerKPIs";
import DailyOperationsGrid from "../components/DailyOperationsGrid";
import DailyTaskList from "../components/DailyTaskList";
import RecentActivities from "../components/RecentActivities";
import styles from "../components/ProjectManagerComponents.module.css";

export default function ManagerOverviewPage() {
  return (
    <div className={styles.container}>
      {/* Header row */}
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Overview</h1>
        <button type="button" className={styles.dateFilter}>
          <Calendar size={16} /> Jan 01 - Jan 30
        </button>
      </div>

      {/* KPIs Grid */}
      <ProjectManagerKPIs />

      {/* Main Contents Grid */}
      <div className={styles.mainGrid}>
        {/* Left Column (Daily Operations) */}
        <DailyOperationsGrid />

        {/* Right Column (Daily task & Activity) */}
        <div className={styles.rightCol}>
          <DailyTaskList />
          <RecentActivities />
        </div>
      </div>
    </div>
  );
}
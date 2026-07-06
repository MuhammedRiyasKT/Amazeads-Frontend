"use client";

import React from "react";
import { Calendar } from "lucide-react";
import styles from "./SalesPage.module.css";

// കംപോണന്റുകൾ ഇമ്പോർട്ട് ചെയ്യുന്നു
import SalesKPI from "../components/SalesKPI";
import DailyOperations from "../components/DailyOperations";
import DailyTasks from "../components/DailyTasks";
import RecentActivity from "../components/RecentActivity";

export default function SalesPage() {
  return (
    <div className={styles.container}>
      {/* Page Header Title Row */}
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Overview</h1>
        <button className={styles.dateFilter}>
          <Calendar size={15} />
          <span>Jan 01 - Jan 30</span>
        </button>
      </div>

      {/* Row 1: KPI Statistics Grid */}
      <SalesKPI styles={styles} />

      {/* Row 2: Split Content Grid */}
      <div className={styles.mainGrid}>
        {/* Left Column: Daily Operations */}
        <DailyOperations styles={styles} />

        {/* Right Column: Daily Tasks & Activity logs */}
        <div className={styles.rightCol}>
          <DailyTasks styles={styles} />
          <RecentActivity styles={styles} />
        </div>
      </div>
    </div>
  );
}
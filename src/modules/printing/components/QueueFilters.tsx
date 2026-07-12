"use client";

import React, { useState } from "react";
import styles from "./PrintingComponents.module.css";

export default function QueueFilters() {
  const [activeTab, setActiveTab] = useState("All Tasks");
  const tabs = [
    { label: "All Tasks", count: 18 },
    { label: "Queued", count: 5 },
    { label: "In Production", count: 8 },
    { label: "Completed", count: 5 }
  ];

  return (
    <div className={styles.filtersBox}>
      {/* Left Tabs */}
      <div className={styles.tabsRow}>
        {tabs.map((tab) => (
          <button
            key={tab.label}
            type="button"
            className={`${styles.tab} ${activeTab === tab.label ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab.label)}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Right Date Filters */}
      <div className={styles.filterControls}>
        <div className={styles.dateCol}>
          <label className={styles.filterLabel}>ASSIGNED AFTER</label>
          <input type="date" className={styles.filterInput} />
        </div>
        <div className={styles.dateCol}>
          <label className={styles.filterLabel}>PROJECT DUE BEFORE</label>
          <input type="date" className={styles.filterInput} />
        </div>
      </div>
    </div>
  );
}
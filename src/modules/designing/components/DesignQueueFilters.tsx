"use client";

import React, { useState } from "react";
import { Calendar } from "lucide-react";
import styles from "./DesigningComponents.module.css";

export default function DesignQueueFilters() {
  const [activeTab, setActiveTab] = useState("All Tasks (18)");
  const tabs = [
    "All Tasks (18)",
    "Queued (6)",
    "Ongoing (8)",
    "Delayed (4)"
  ];

  return (
    <div className={styles.filtersBox}>
      {/* Left Tabs */}
      <div className={styles.tabsRow}>
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Right Date Range Display */}
      <div className={styles.dateFilter}>
        <Calendar size={16} /> 04 Oct - 10 Oct
      </div>
    </div>
  );
}
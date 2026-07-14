"use client";

import React, { useState } from "react";
import { Calendar } from "lucide-react";
import styles from "./ProductionComponents.module.css";

export default function ProductionQueueFilters() {
  const [activeTab, setActiveTab] = useState("All Tasks (14)");
  const tabs = [
    "All Tasks (14)",
    "Queued (4)",
    "Ongoing (7)",
    "Delayed (1)"
  ];

  return (
    <div className={styles.filtersBox}>
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

      <div className={styles.dateFilter}>
        <Calendar size={16} /> 04 Oct - 10 Oct
      </div>
    </div>
  );
}
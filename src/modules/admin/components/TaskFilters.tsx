"use client";

import React from "react";
import { Search } from "lucide-react";
import Input from "@/components/ui/Input";
import styles from "./TaskComponents.module.css";

interface TaskFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function TaskFilters({ searchQuery, setSearchQuery, activeTab, setActiveTab }: TaskFiltersProps) {
  const tabs = ["All Tasks", "Pending Tasks", "Completed"];

  return (
    <div className={styles.filtersBox}>
      {/* Tabs list on left */}
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

      {/* Controls on right */}
      <div className={styles.filterControls}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <Input
            type="text"
            placeholder="Search by name, ID or task..."
            className={styles.customInputOverride}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
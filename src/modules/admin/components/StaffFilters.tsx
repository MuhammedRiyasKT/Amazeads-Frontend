"use client";

import React from "react";
import { Search } from "lucide-react";
import Input from "@/components/ui/Input";
import styles from "./StaffComponents.module.css";

interface StaffFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

export default function StaffFilters({ searchQuery, setSearchQuery }: StaffFiltersProps) {
  return (
    <div className={styles.filtersBox}>
      <div className={styles.filterControls}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <Input
            type="text"
            placeholder="Search by name or ID..."
            className={styles.customInputOverride}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select className={styles.selectDropdown}>
          <option>Departments</option>
        </select>

        <select className={styles.selectDropdown}>
          <option>All Roles</option>
        </select>

        <select className={styles.selectDropdown}>
          <option>All Status</option>
        </select>
      </div>
    </div>
  );
}
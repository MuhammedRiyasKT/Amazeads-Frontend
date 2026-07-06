"use client";

import React from "react";
import { Search, CalendarDays, SlidersHorizontal } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import styles from "./OrdersComponents.module.css";

interface OrdersFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  paymentFilter: string;
  setPaymentFilter: (filter: string) => void;
}

export default function OrdersFilters({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  paymentFilter,
  setPaymentFilter,
}: OrdersFiltersProps) {
  const tabs = ["All Orders", "Today's Orders", "Converted Orders", "Pending Convertion"];

  const togglePaymentFilter = () => {
    setPaymentFilter(paymentFilter === "All" ? "PAID" : paymentFilter === "PAID" ? "DUE" : "All");
  };

  return (
    <div className={styles.filtersBox}>
      {/* ഇടതുവശത്ത് ടാബുകൾ വരുന്നു */}
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

      {/* വലതുവശത്ത് സെർച്ചും മറ്റ് ഫിൽട്ടറുകളും വരുന്നു */}
      <div className={styles.filterControls}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <Input 
            type="text" 
            placeholder="Search here..." 
            className={styles.customInputOverride}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button variant="outline" size="sm" onClick={togglePaymentFilter} className={styles.gapButton}>
          <SlidersHorizontal size={14} /> Payment: {paymentFilter}
        </Button>

        <Button variant="outline" size="sm" className={styles.gapButton}>
          <CalendarDays size={14} /> Last 30 Days
        </Button>
      </div>
    </div>
  );
}
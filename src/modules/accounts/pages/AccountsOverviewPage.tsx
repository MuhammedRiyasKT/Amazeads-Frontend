"use client";

import React from "react";
import { Plus, Calendar } from "lucide-react";
import Button from "@/components/ui/Button";
import AccountsKPIs from "../components/AccountsKPIs";
import RecentTransactionsTable from "../components/RecentTransactionsTable";
import Checklist from "@/modules/admin/components/Checklist"; // അഡ്മിൻ ചെക്ക്‌ലിസ്റ്റ് റീയൂസ് ചെയ്യുന്നു
import PendingReceivables from "../components/PendingReceivables";
import BankAccountSummary from "../components/BankAccountSummary";
import styles from "../components/AccountsComponents.module.css";

export default function AccountsOverviewPage() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerRow}>
        <div className={styles.filterTabs}>
          <button className={styles.filterTab}>Today</button>
          <button className={styles.filterTab}>Week</button>
          <button className={`${styles.filterTab} ${styles.filterTabActive}`}>Month</button>
          <button className={styles.filterTab}>Year</button>
          <button className={styles.filterTab} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Calendar size={14} /> Custom
          </button>
        </div>

        <Button variant="primary" size="sm" className={styles.addExpenseBtn}>
          <Plus size={16} /> Add Expense
        </Button>
      </div>

      {/* KPIs Grid */}
      <AccountsKPIs />

      {/* Main Contents Grid */}
      <div className={styles.mainGrid}>
        {/* Left Column */}
        <div className={styles.leftCol}>
          <RecentTransactionsTable />
          <Checklist />
        </div>

        {/* Right Column */}
        <div className={styles.rightCol}>
          <PendingReceivables />
          <BankAccountSummary />
        </div>
      </div>
    </div>
  );
}
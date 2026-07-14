"use client";

import React from "react";
import { Calendar } from "lucide-react";
import MarketingKPIs from "../components/MarketingKPIs";
import CampaignsTable from "../components/CampaignsTable";
import MarketingChecklist from "../components/MarketingChecklist";
import styles from "../components/MarketingComponents.module.css";

export default function MarketingOverviewPage() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Marketing Command Center</h1>
          <p className={styles.subtitle}>Track active campaigns, lead generation pipelines, and acquisition budgets.</p>
        </div>
        <button type="button" className={styles.dateFilter}>
          <Calendar size={16} /> Jan 01 - Jan 30
        </button>
      </div>

      {/* KPIs Grid */}
      <MarketingKPIs />

      {/* Main Contents Grid */}
      <div className={styles.mainGrid}>
        {/* Left Column (Active Campaigns Table) */}
        <CampaignsTable />

        {/* Right Column (Marketing Operations Checklist) */}
        <MarketingChecklist />
      </div>
    </div>
  );
}
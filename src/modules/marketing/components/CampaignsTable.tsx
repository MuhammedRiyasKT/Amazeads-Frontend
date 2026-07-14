"use client";

import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import styles from "./MarketingComponents.module.css";

export default function CampaignsTable() {
  const campaigns = [
    { name: "Google search ads Q3", platform: "Google Ads", leads: 450, budget: "₹15,000", roi: "High ROI", statusClass: styles.statusCompleted },
    { name: "Meta retargeting funnel", platform: "Facebook/Meta", leads: 320, budget: "₹18,000", roi: "Stable", statusClass: styles.statusProgress },
    { name: "Weekly product newsletter", platform: "Email List", leads: 85, budget: "₹1,500", roi: "Stable", statusClass: styles.statusProgress },
    { name: "Twitter/X promo post", platform: "Twitter Ads", leads: 12, budget: "₹5,000", roi: "Underperforming", statusClass: styles.statusDanger },
  ];

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableTitleRow}>
        <span className={styles.tableTitle}>ACTIVE CAMPAIGN TRACKER</span>
      </div>

      <div className={styles.tableContainer}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead style={{ width: "180px" }}>CAMPAIGN NAME</TableHead>
              <TableHead style={{ width: "130px" }}>PLATFORM</TableHead>
              <TableHead style={{ width: "110px", textAlign: "center" }}>LEADS</TableHead>
              <TableHead style={{ width: "110px" }}>SPENT (₹)</TableHead>
              <TableHead style={{ width: "130px" }}>ROI STATUS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((camp) => (
              <TableRow key={camp.name}>
                <TableCell style={{ fontWeight: 700, color: "#0f172a" }}>{camp.name}</TableCell>
                <TableCell>{camp.platform}</TableCell>
                <td className={styles.textCenter}>{camp.leads}</td>
                <TableCell style={{ fontWeight: 700 }}>{camp.budget}</TableCell>
                <TableCell>
                  <span className={`${styles.badge} ${camp.statusClass}`}>{camp.roi}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
"use client";

import React from "react";
import { Printer, CheckCircle } from "lucide-react";
import styles from "./ProjectManagerComponents.module.css";

export default function RecentActivities() {
  const activities = [
    { id: 1, text: "Order #SO-98421 changed to Printing", time: "5 mins ago", icon: Printer, iconClass: styles.activityIconBlue },
    { id: 2, text: "Payment of ₹ 42,500 received for Invoice #8841", time: "2 hours ago", icon: CheckCircle, iconClass: styles.activityIconGreen },
  ];

  return (
    <div className={styles.boxCard}>
      <div className={styles.boxHeader}>
        <span className={styles.boxTitle}>Activity</span>
        <a href="#" className={styles.seeAllLink}>See all</a>
      </div>

      <div className={styles.activityList}>
        {activities.map((act) => {
          const Icon = act.icon;
          return (
            <div key={act.id} className={styles.activityItem}>
              <div className={`${styles.activityIconWrapper} ${act.iconClass}`}>
                <Icon size={18} />
              </div>
              <div className={styles.activityInfo}>
                <p className={styles.activityText}>{act.text}</p>
                <span className={styles.activityTime}>{act.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
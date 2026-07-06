"use client";

import React from "react";
import { Printer, CheckCircle2 } from "lucide-react";

interface RecentActivityProps {
  styles: Record<string, string>;
}

export default function RecentActivity({ styles }: RecentActivityProps) {
  return (
    <div className={styles.sectionBox}>
      <div className={styles.boxHeader}>
        <h2 className={styles.boxTitle}>Activity</h2>
        <a href="#see-all" className={styles.seeAllLink}>
          See all
        </a>
      </div>

      <div className={styles.activityList}>
        {/* Activity Item 1 */}
        <div className={styles.activityItem}>
          <div
            className={styles.activityIcon}
            style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}
          >
            <Printer size={15} />
          </div>
          <div className={styles.activityInfo}>
            <p className={styles.activityText}>
              Order <a href="#so-98421">#SO-98421</a> changed to{" "}
              <strong>Printing</strong>
            </p>
            <span className={styles.activityTime}>5 mins ago</span>
          </div>
        </div>

        {/* Activity Item 2 */}
        <div className={styles.activityItem}>
          <div
            className={styles.activityIcon}
            style={{ backgroundColor: "#dcfce7", color: "#15803d" }}
          >
            <CheckCircle2 size={15} />
          </div>
          <div className={styles.activityInfo}>
            <p className={styles.activityText}>
              Payment of <strong>₹ 42,500</strong> received for Invoice{" "}
              <strong>#8841</strong>
            </p>
            <span className={styles.activityTime}>2 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
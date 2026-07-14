"use client";

import React from "react";
import { Play, CheckSquare } from "lucide-react";
import Button from "@/components/ui/Button";
import styles from "./ProductionComponents.module.css";

export default function ProductionCardGrid() {
  return (
    <div className={styles.cardGrid}>
      {/* Card 1: Overdue (Red) */}
      <div className={`${styles.jobCard} ${styles.cardOverdue}`}>
        <div className={styles.jobHeader}>
          <span className={`${styles.jobBadge} ${styles.badgeOverdue}`}>! OVERDUE PRODUCTION JOB</span>
          <span className={styles.clientName}>CRYSTAL ARTS LTD</span>
        </div>

        <div className="flex justify-between items-baseline mt-4">
          <div>
            <h3 className={styles.jobTitle}>ACRYLIC FRAME 12X18</h3>
            <div className={styles.jobMeta}>Task #601 | Ord #AM71</div>
          </div>
          <div className="text-right">
            <span className={styles.targetLabel}>Target Date</span>
            <div className={styles.targetOverdue}>30/05/2026</div>
          </div>
        </div>

        <div className={`${styles.instructionsBox} ${styles.instOverdue}`}>
          <span className={styles.instLabel}>Production Instructions:</span>
          <p className={styles.instText}>
            Ensure high-gloss finish. Double check edge polishing before packaging.
          </p>
        </div>

        <div className={styles.actionRow}>
          <Button variant="outline" size="sm" className="w-full">View Details</Button>
          <Button variant="primary" size="sm" className={`${styles.btnFinish} w-full`}>
            <CheckSquare size={15} /> Finish Production
          </Button>
        </div>
      </div>

      {/* Card 2: Queued (Purple) */}
      <div className={`${styles.jobCard} ${styles.cardQueued}`}>
        <div className={styles.jobHeader}>
          <span className={`${styles.jobBadge} ${styles.badgeQueued}`}>QUEUED</span>
          <span className={styles.clientName}>Rahul Kumar</span>
        </div>

        <div className="flex justify-between items-baseline mt-4">
          <div>
            <h3 className={styles.jobTitle}>Crystal Wall Frame (24×36)</h3>
            <div className={styles.jobMeta}>Task #602 | Ord #AM72</div>
          </div>
          <div className="text-right">
            <span className={styles.targetLabel}>Target Date</span>
            <div className={styles.targetNormal}>07/06/2026</div>
          </div>
        </div>

        <div className={`${styles.instructionsBox} ${styles.instQueued}`}>
          <span className={styles.instLabel}>Production Instructions:</span>
          <p className={styles.instText}>
            Standard framing sequence. Use premium matte mountboard.
          </p>
        </div>

        <div className={styles.actionRow}>
          <Button variant="outline" size="sm" className="w-full">View Details</Button>
          <Button variant="primary" size="sm" className={`${styles.btnStart} w-full`}>
            <Play size={14} fill="currentColor" /> Start Production
          </Button>
        </div>
      </div>
    </div>
  );
}
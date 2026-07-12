"use client";

import React from "react";
import { User, AlertTriangle, Play, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import styles from "./PrintingComponents.module.css";

export default function QueueCardGrid() {
  return (
    <div className={styles.cardGrid}>
      {/* Card 1: Overdue Print Job (Red Theme) */}
      <div className={`${styles.jobCard} ${styles.cardOverdue}`}>
        <div className={styles.jobHeader}>
          <span className={`${styles.jobBadge} ${styles.badgeOverdue}`}>! OVERDUE PRINT JOB</span>
          <div className={styles.customerGroup}>
            <User size={14} className="text-purple-600" />
            <span className={styles.customerName}>CUSTOMER: <strong className="text-slate-800">MANASSI STUDIO</strong></span>
          </div>
        </div>

        <div className="mt-4">
          <h3 className={styles.jobTitle}>ÊFRAME 12X12 B2</h3>
          <div className={styles.jobMeta}>Task #519  |  Ord #AM61</div>
        </div>

        <div className={`${styles.instructionsBox} ${styles.instOverdue}`}>
          <span className={styles.instLabel}>PRINT INSTRUCTIONS:</span>
          <p className={styles.instText}>nalla print aakanam</p>
        </div>

        <div className={styles.jobFooter}>
          <div>
            <span className={styles.footerLabel}>ASSIGNED BY</span>
            <div className={styles.footerVal}>Sreejith Preobject</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span className={styles.footerLabel}>TARGET DATE</span>
            <div className={`${styles.footerVal} ${styles.targetOverdue}`}>
              <AlertTriangle size={14} /> 30/05/2026
            </div>
          </div>
        </div>

        <div className={styles.actionRow}>
          <Button variant="outline" size="sm" className="w-full">View Details</Button>
          <Button variant="primary" size="sm" className={`${styles.btnFinish} w-full`}>
            <CheckCircle size={15} /> Finish Production
          </Button>
        </div>
      </div>

      {/* Card 2: Queued Print Job (Blue Theme) */}
      <div className={`${styles.jobCard} ${styles.cardQueued}`}>
        <div className={styles.jobHeader}>
          <span className={`${styles.jobBadge} ${styles.badgeQueued}`}>QUEUED</span>
          <div className={styles.customerGroup}>
            <User size={14} className="text-blue-600" />
            <span className={styles.customerName}>CUSTOMER: <strong className="text-slate-800">Rajesh Kumar</strong></span>
          </div>
        </div>

        <div className="mt-4">
          <h3 className={styles.jobTitle}>Acrylic Photo Print (18×24)</h3>
          <div className={styles.jobMeta}>Task #520  |  Ord #AM62</div>
        </div>

        <div className={`${styles.instructionsBox} ${styles.instQueued}`}>
          <span className={styles.instLabel}>PRINT INSTRUCTIONS:</span>
          <p className={styles.instText}>Glossy finish, high contrast</p>
        </div>

        <div className={styles.jobFooter}>
          <div>
            <span className={styles.footerLabel}>ASSIGNED BY</span>
            <div className={styles.footerVal}>Sreejith Preobject</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span className={styles.footerLabel}>TARGET DATE</span>
            <div className={styles.footerVal}>07/06/2026</div>
          </div>
        </div>

        <div className={styles.actionRow}>
          <Button variant="outline" size="sm" className="w-full">View Details</Button>
          <Button variant="primary" size="sm" className={`${styles.btnStart} w-full`}>
            <Play size={14} fill="currentColor" /> Start Printing
          </Button>
        </div>
      </div>
    </div>
  );
}
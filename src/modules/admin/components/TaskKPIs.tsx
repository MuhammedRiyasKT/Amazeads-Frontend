"use client";

import React from "react";
import { Users, ClipboardList, CheckCircle2, AlertTriangle } from "lucide-react";
import { StaffSummary } from "../services/task.service";
import styles from "./TaskComponents.module.css";

interface TaskKPIsProps {
  summary: StaffSummary[];
}

export default function TaskKPIs({ summary }: TaskKPIsProps) {
  // 1. എപിഐ ഡാറ്റയിൽ നിന്നും ടോട്ടൽ സ്റ്റാഫ്
  const totalStaff = summary.length;

  // 2. എപിഐ ഡാറ്റയിലെ ആകെ ടാസ്കുകൾ (ഡമ്മി എക്സ്ട്രാ ടാസ്ക് ഒഴിവാക്കി)
  const todaysTasks = summary.reduce((acc, curr) => acc + curr.total_tasks, 0);

  // 3. ആകെ പൂർത്തിയായവ
  const completedTasks = summary.reduce((acc, curr) => acc + curr.completed_tasks, 0);

  // 4. ആകെ പെൻഡിങ് ഉള്ളവ (Overdue ഒഴിവാക്കി പകരം പെൻഡിങ് കാർഡ് വെവ്വേറെ സെറ്റ് ചെയ്തു)
  const pendingTasks = summary.reduce((acc, curr) => acc + curr.pending_tasks, 0);

  return (
    <div className={styles.kpiGrid}>
      {/* Card 1: Total Staff */}
      <div className={styles.kpiCard}>
        <div className={`${styles.kpiIconCircle} ${styles.iconBlue}`}>
          <Users size={20} />
        </div>
        <div className={styles.kpiInfo}>
          <span className={styles.kpiLabel}>Total Staff</span>
          <strong className={styles.kpiValue}>{totalStaff}</strong>
        </div>
      </div>

      {/* Card 2: Today's Tasks */}
      <div className={styles.kpiCard}>
        <div className={`${styles.kpiIconCircle} ${styles.iconOrange}`}>
          <ClipboardList size={20} />
        </div>
        <div className={styles.kpiInfo}>
          <span className={styles.kpiLabel}>Total Tasks</span>
          <strong className={styles.kpiValue}>{todaysTasks}</strong>
        </div>
      </div>

      {/* Card 3: Completed */}
      <div className={styles.kpiCard}>
        <div className={`${styles.kpiIconCircle} ${styles.iconGreen}`}>
          <CheckCircle2 size={20} />
        </div>
        <div className={styles.kpiInfo}>
          <span className={styles.kpiLabel}>Completed</span>
          <strong className={styles.kpiValue} style={{ color: "#0ca678" }}>
            {completedTasks}
          </strong>
        </div>
      </div>

      {/* Card 4: Pending */}
      <div className={styles.kpiCard}>
        <div className={`${styles.kpiIconCircle} ${styles.iconRed}`}>
          <AlertTriangle size={20} />
        </div>
        <div className={styles.kpiInfo}>
          <span className={styles.kpiLabel}>Pending</span>
          <strong className={styles.kpiValue} style={{ color: "#f76707" }}>
            {pendingTasks}
          </strong>
        </div>
      </div>
    </div>
  );
}
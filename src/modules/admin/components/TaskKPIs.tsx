"use client";

import React from "react";
import { Users, ClipboardList, CheckCircle2, AlertTriangle } from "lucide-react";
import { StaffSummary } from "../services/task.service";
import styles from "./TaskComponents.module.css";

interface TaskKPIsProps {
  summary: StaffSummary[];
}

export default function TaskKPIs({ summary }: TaskKPIsProps) {
  // 1. എപിഐ ഡാറ്റയിൽ നിന്നും ടോട്ടൽ സ്റ്റാഫ് കണക്കാക്കുന്നു
  const totalStaff = summary.length;

  // 2. എപിഐ ഡാറ്റയിലെ ആകെ ഡെയ്‌ലി ടാസ്കുകൾ കണക്കാക്കുന്നു
  const totalDailyTasks = summary.reduce((acc, curr) => acc + curr.total_tasks, 0);
  const dummyExtraTasks = 12; // നിങ്ങൾ ആവശ്യപ്പെട്ട ഡമ്മി എക്സ്ട്രാ ടാസ്ക് കൗണ്ട്
  const todaysTasks = totalDailyTasks + dummyExtraTasks;

  // 3. പൂർത്തിയായവയും പെൻഡിങ് ഉള്ളവയും കണക്കാക്കുന്നു
  const completedTasks = summary.reduce((acc, curr) => acc + curr.completed_tasks, 0);
  const pendingTasks = summary.reduce((acc, curr) => acc + curr.pending_tasks, 0);

  // 4. ഓവർഡ്യൂ ടാസ്കുകൾ (നിങ്ങൾ ആവശ്യപ്പെട്ട ഡമ്മി കൗണ്ട്)
  const overdueTasks = 6;

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
          <span className={styles.kpiLabel}>Today's Tasks</span>
          <strong className={styles.kpiValue}>
            {todaysTasks} <span className={styles.kpiExtraText}>({dummyExtraTasks} Extra)</span>
          </strong>
        </div>
      </div>

      {/* Card 3: Completed / Pending */}
      <div className={styles.kpiCard}>
        <div className={`${styles.kpiIconCircle} ${styles.iconGreen}`}>
          <CheckCircle2 size={20} />
        </div>
        <div className={styles.kpiInfo}>
          <span className={styles.kpiLabel}>Completed / Pending</span>
          <strong className={styles.kpiValue}>
            {completedTasks} <span className="text-slate-400 font-medium">/</span> {pendingTasks}
          </strong>
        </div>
      </div>

      {/* Card 4: Overdue */}
      <div className={styles.kpiCard}>
        <div className={`${styles.kpiIconCircle} ${styles.iconRed}`}>
          <AlertTriangle size={20} />
        </div>
        <div className={styles.kpiInfo}>
          <span className={styles.kpiLabel}>Overdue</span>
          <strong className={styles.kpiValue} style={{ color: "#ef4444" }}>
            {overdueTasks}
          </strong>
        </div>
      </div>
    </div>
  );
}
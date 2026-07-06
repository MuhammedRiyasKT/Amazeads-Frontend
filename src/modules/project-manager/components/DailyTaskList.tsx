"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import styles from "./ProjectManagerComponents.module.css";

export default function DailyTaskList() {
  const tasks = [
    { id: 1, text: "Call customer Rajesh for advance payment", extra: "09:15 AM", checked: true, badge: null },
    { id: 2, text: "Send quotation for acrylic frames", extra: "", checked: false, badge: "URGENT", badgeClass: styles.badgeDanger },
    { id: 3, text: "Update employee attendance records", extra: "10:00 AM", checked: true, badge: null },
    { id: 4, text: "Approve design for Gupta wedding album", extra: "09:45 AM", checked: true, badge: null },
  ];

  return (
    <div className={styles.boxCard}>
      <div className={styles.boxHeader}>
        <div className="flex items-center gap-3">
          <span className={styles.boxTitle}>Daily task</span>
          <span className={styles.pendingBadge}>4 Pending</span>
        </div>
      </div>

      <div className={styles.taskList}>
        {tasks.map((task) => (
          <div key={task.id} className={styles.taskItem}>
            <div className={styles.taskLeft}>
              {task.checked ? (
                <CheckCircle2 size={18} className={styles.checkedIcon} />
              ) : (
                <div className={styles.uncheckedCircle} />
              )}
              <span className={`${styles.taskText} ${task.checked ? styles.lineThrough : ""}`}>
                {task.text}
              </span>
            </div>
            <div className={styles.taskRight}>
              {task.badge ? (
                <span className={`${styles.checkBadge} ${task.badgeClass}`}>{task.badge}</span>
              ) : (
                <span className={styles.timeText}>{task.extra}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
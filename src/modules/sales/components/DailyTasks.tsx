"use client";

import React from "react";
import { CheckSquare, Square } from "lucide-react";

interface DailyTasksProps {
  styles: Record<string, string>;
}

export default function DailyTasks({ styles }: DailyTasksProps) {
  const tasks = [
    {
      text: "Call customer Rajesh for advance payment",
      time: "09:15 AM",
      completed: true,
    },
    {
      text: "Send quotation for acrylic frames",
      completed: false,
      urgent: true,
    },
    {
      text: "Update employee attendance records",
      time: "10:00 AM",
      completed: true,
    },
    {
      text: "Approve design for Gupta wedding album",
      time: "09:45 AM",
      completed: true,
    },
  ];

  return (
    <div className={styles.sectionBox}>
      <div className={styles.boxHeader}>
        <h2 className={styles.boxTitle}>Daily task</h2>
        <span className={styles.headerBadge}>4 Pending</span>
      </div>

      <div className={styles.taskList}>
        {tasks.map((task, idx) => (
          <div key={idx} className={styles.taskItem}>
            <div className={styles.taskLeft}>
              <div className={styles.checkboxWrap}>
                {task.completed ? (
                  <CheckSquare className={styles.checkboxChecked} size={18} />
                ) : (
                  <Square className={styles.checkboxUnchecked} size={18} />
                )}
              </div>
              <span
                className={`${styles.taskText} ${
                  task.completed ? styles.taskDoneText : ""
                }`}
              >
                {task.text}
              </span>
            </div>
            <div className={styles.taskRight}>
              {task.urgent ? (
                <span className={styles.urgentBadge}>URGENT</span>
              ) : (
                <span className={styles.taskTime}>{task.time}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
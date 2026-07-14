"use client";

import React from "react";
import { ListTodo, CheckCircle2 } from "lucide-react";
import styles from "./HRComponents.module.css";

export default function HRChecklist() {
  const tasks = [
    { id: 1, text: "Verify monthly attendance and late check-ins", checked: true },
    { id: 2, text: "Audit and verify pending leave requests", checked: true },
    { id: 3, text: "Process monthly payroll slip calculations", checked: false },
    { id: 4, text: "Schedule onboarding review for new staff", checked: false },
  ];

  return (
    <div className={styles.boxCard}>
      <div className={styles.boxHeader}>
        <span className={styles.boxTitle}>Operations Checklist</span>
        <ListTodo size={16} className={styles.boxHeaderIcon} />
      </div>

      <div className={styles.list}>
        {tasks.map((task) => (
          <div key={task.id} className={styles.checkItem}>
            <div className={styles.checkLeft}>
              {task.checked ? (
                <CheckCircle2 size={18} className={styles.checkedIcon} />
              ) : (
                <div className={styles.uncheckedCircle} />
              )}
              <span className={`${styles.checkText} ${task.checked ? styles.lineThrough : ""}`}>
                {task.text}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
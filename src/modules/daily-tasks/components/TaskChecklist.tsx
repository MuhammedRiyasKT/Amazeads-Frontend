"use client";

import React from "react";
import { AssignedTask } from "../services/task.service";
import styles from "./DailyTasksComponents.module.css";

interface TaskChecklistProps {
  tasks: AssignedTask[];
  onToggleTask: (task: AssignedTask) => void;
  onAddReasonClick: (task: AssignedTask) => void;
  onViewReasonClick: (task: AssignedTask) => void;
}

export default function TaskChecklist({ tasks, onToggleTask, onAddReasonClick, onViewReasonClick }: TaskChecklistProps) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.tracking_status?.toLowerCase() === "completed").length;
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className={styles.checklistCard}>
      {/* Title block */}
      <div className={styles.checklistHeader}>
        <h2 className={styles.checklistTitle}>Daily Operations Checklist</h2>
        <p className={styles.checklistSub}>Standard operating procedures for peak performance</p>
      </div>

      {/* Checklist items list */}
      <div className={styles.checklistRows}>
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            No daily operations checklist found for today.
          </div>
        ) : (
          tasks.map((task) => {
            const isCompleted = task.tracking_status?.toLowerCase() === "completed";
            const isFlexible = task.flexible_status === true; 

            return (
              <div 
                key={task.assignment_id} 
                className={`
                  ${styles.checkRow} 
                  ${isCompleted ? styles.completedRow : ""}
                  ${isFlexible && !isCompleted ? styles.flexibleRow : ""} 
                `} // ഫ്ലെക്സിബിൾ ടാസ്കിന് കസ്റ്റം സ്റ്റൈൽ നൽകുന്നു
              >
                <div className={styles.rowLeft}>
                  <input
                    type="checkbox"
                    className={`${styles.checkbox} ${isCompleted ? styles.checkboxDisabled : ""}`}
                    checked={isCompleted}
                    disabled={isCompleted}
                    onChange={() => onToggleTask(task)} 
                  />
                  <div className={styles.taskInfo}>
                    <div className="flex items-center gap-2">
                      <span className={`${styles.taskTitle} ${isCompleted ? styles.completedText : ""}`}>
                        {task.task_name}
                      </span>
                      {/* ഫ്ലെക്സിബിൾ ആണെങ്കിൽ മാൻഡേറ്ററി ബാഡ്ജ് കാണിക്കുന്നു */}
                      {isFlexible && !isCompleted && (
                        <span className="text-[9px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                          Mandatory Chore
                        </span>
                      )}
                    </div>
                    <span className={styles.taskDesc}>{task.task_description}</span>
                    
                    {task.work_description && !isCompleted && (
                      <button
                        type="button"
                        onClick={() => onViewReasonClick(task)}
                        className="text-[11px] bg-amber-50 hover:bg-amber-100 border border-amber-100 text-amber-800 px-2.5 py-0.5 rounded mt-1.5 w-fit font-semibold cursor-pointer transition-all text-left"
                      >
                        View Logged Reason
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`${styles.statusLabel} ${isCompleted ? styles.statusCompleted : styles.statusPending}`}>
                    {isCompleted ? "COMPLETED" : "PENDING"}
                  </span>
                  
                  {/* ഫ്ലെക്സിബിൾ സ്റ്റാറ്റസ് ട്രൂ ആണെങ്കിൽ റീസൺ എഴുതാനുള്ള ബട്ടൺ പൂർണ്ണമായി മറയ്ക്കുന്നു (പ്രധാന തിരുത്ത്!) */}
                  {!isCompleted && !isFlexible && (
                    <button
                      type="button"
                      onClick={() => onAddReasonClick(task)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline cursor-pointer"
                    >
                      Log Reason
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Progress Footer */}
      {total > 0 && (
        <div className={styles.progressFooter}>
          <div className={styles.progressLabelRow}>
            <span className={styles.progressCount}>PROGRESS: {completed} OF {total} COMPLETED</span>
            <span className={styles.percentageText}>{progressPct}%</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
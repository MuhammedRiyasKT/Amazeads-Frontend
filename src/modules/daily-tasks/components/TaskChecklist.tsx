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

// Priority badge
function getPriorityBadge(priority: number | null | undefined) {
  if (!priority) return null;
  const config: Record<number, { label: string; className: string }> = {
    1: { label: "High",   className: "bg-rose-100 text-rose-700 border border-rose-200" },
    2: { label: "Medium", className: "bg-amber-100 text-amber-700 border border-amber-200" },
    3: { label: "Low",    className: "bg-slate-100 text-slate-600 border border-slate-200" },
  };
  const c = config[priority] || { label: `P${priority}`, className: "bg-slate-100 text-slate-500 border border-slate-200" };
  return (
    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${c.className}`}>
      {c.label}
    </span>
  );
}

// Overdue days — positive = overdue, null = today/future
function getOverdueDays(workDate: string | null | undefined): number | null {
  if (!workDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const wd = new Date(workDate);
  wd.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - wd.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : null;
}

function formatWorkDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
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
            const overdueDays = !isCompleted ? getOverdueDays(task.work_date) : null;

            return (
              <div
                key={`${task.assignment_id}-${task.work_date || ""}`}
                className={`
                  ${styles.checkRow}
                  ${isCompleted ? styles.completedRow : ""}
                  ${isFlexible && !isCompleted ? styles.flexibleRow : ""}
                `}
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
                    {/* Task name + priority + mandatory badge */}
                    <div className="flex items-center flex-wrap gap-2">
                      <span className={`${styles.taskTitle} ${isCompleted ? styles.completedText : ""}`}>
                        {task.task_name}
                      </span>

                      {/* Priority badge */}
                      {getPriorityBadge(task.priority)}

                      {/* Mandatory Chore badge */}
                      {isFlexible && !isCompleted && (
                        <span className="text-[9px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded uppercase tracking-wide border border-indigo-200">
                          Mandatory Chore
                        </span>
                      )}
                    </div>

                    <span className={styles.taskDesc}>{task.task_description}</span>

                    {/* Work date + overdue badge */}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] font-semibold text-slate-400">
                        Work Date:{" "}
                        <span className="text-slate-600">{formatWorkDate(task.work_date)}</span>
                      </span>
                      {overdueDays !== null && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                          {overdueDays} {overdueDays === 1 ? "day" : "days"} overdue
                        </span>
                      )}
                    </div>

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
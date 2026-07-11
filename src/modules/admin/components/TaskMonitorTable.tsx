"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { StaffSummary } from "../services/task.service";
import styles from "./TaskComponents.module.css";

interface TaskMonitorTableProps {
  summary: StaffSummary[];
}

export default function TaskMonitorTable({ summary }: TaskMonitorTableProps) {
  
  const getDeptClass = (dept: string) => {
    const d = dept.toLowerCase();
    if (d === "sales") return styles.deptSales;
    if (d === "project manager") return styles.deptPm;
    if (d === "printing") return styles.deptPrinting;
    return styles.deptGeneral;
  };

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableTitleRow}>
        <span className={styles.tableTitle}>TASK MONITOR</span>
      </div>

      <div className={styles.tableContainer}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead style={{ width: "160px" }}>DEPARTMENT</TableHead>
              <TableHead style={{ width: "240px" }}>ASSIGNED STAFF</TableHead>
              <TableHead className={styles.textCenter} style={{ width: "110px" }}>DAILY TASKS</TableHead>
              <TableHead className={styles.textCenter} style={{ width: "110px" }}>EXTRA TASKS</TableHead>
              <TableHead className={styles.textCenter} style={{ width: "110px" }}>TOTAL TASKS</TableHead>
              <TableHead className={styles.textCenter} style={{ width: "120px" }}>COMPLETED</TableHead>
              <TableHead className={styles.textCenter} style={{ width: "110px" }}>PENDING</TableHead>
              <TableHead style={{ width: "220px" }}>PROGRESS %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summary.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                  No operational records found.
                </TableCell>
              </TableRow>
            ) : (
              summary.map((staff) => {
                const isEven = staff.staff_id % 2 === 0;
                const extraTasks = isEven ? 2 : 0;
                const dailyTasks = staff.total_tasks;
                const totalTasks = dailyTasks + extraTasks;
                
                const progressPct = totalTasks > 0 ? Math.round((staff.completed_tasks / totalTasks) * 100) : 0;

                return (
                  <TableRow key={staff.staff_id}>
                    <TableCell>
                      <span className={`${styles.deptBadge} ${getDeptClass(staff.role_name)}`}>
                        {staff.role_name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className={styles.staffNameBold}>{staff.staff_name}</div>
                        <div className={styles.staffSubRole}>Senior Framer</div>
                      </div>
                    </TableCell>
                    <td className={styles.textCenter}>{dailyTasks}</td>
                    <td className={`${styles.textCenter} text-indigo-600`}>{extraTasks}</td>
                    <td className={`${styles.textCenter} ${styles.textBold}`}>{totalTasks}</td>
                    <td className={styles.textCenter}>
                      <span className={styles.completedBubble}>{staff.completed_tasks}</span>
                    </td>
                    <td className={styles.textCenter}>
                      <span className={styles.pendingBubble}>{staff.pending_tasks}</span>
                    </td>
                    <TableCell>
                      <div className={styles.progressCell}>
                        <div className={styles.progressBar}>
                          <div 
                            className={`${styles.progressBar} ${progressPct === 100 ? styles.progressFillGreen : styles.progressFillBlue}`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <span>{progressPct}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* പ്രൊഫഷണൽ ശൈലിയിലേക്ക് തിരുത്തിയെഴുതിയ പുതിയ പേജിനേഷൻ യുഐ */}
      <div className={styles.paginationRow}>
        <div className={styles.resultsText}>Showing 1-3 of {summary.length} Staff Members</div>
        <div className={styles.pageList}>
          <button className={styles.pageBtn}><ChevronLeft size={16} /></button>
          <button className={`${styles.pageBtn} ${styles.pageActive}`}>1</button>
          <button className={styles.pageBtn}>2</button>
          <button className={styles.pageBtn}>3</button>
          <button className={styles.pageBtn}><ChevronRight size={16} /></button>
        </div>
      </div>
    </div>
  );
}
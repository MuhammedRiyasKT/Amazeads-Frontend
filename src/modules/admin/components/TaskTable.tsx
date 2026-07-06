"use client";

import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { TaskTracking } from "../services/task.service";
import styles from "./TaskComponents.module.css";

interface TaskTableProps {
  tasks: TaskTracking[];
}

export default function TaskTable({ tasks }: TaskTableProps) {
  const getInitials = (name: string) => {
    return name ? name.substring(0, 2).toUpperCase() : "ST";
  };

  const getPriorityBadge = (priority: number) => {
    if (priority === 3) return <span className={`${styles.badge} ${styles.priorityHigh}`}>High</span>;
    if (priority === 2) return <span className={`${styles.badge} ${styles.priorityMedium}`}>Medium</span>;
    return <span className={`${styles.badge} ${styles.priorityLow}`}>Low</span>;
  };

  const getStatusBadge = (status: string) => {
    if (status === "Completed") return <span className={`${styles.badge} ${styles.statusCompleted}`}>Completed</span>;
    if (status === "In Progress") return <span className={`${styles.badge} ${styles.statusProgress}`}>In Progress</span>;
    return <span className={`${styles.badge} ${styles.statusPending}`}>Not Started</span>;
  };

  return (
    <div className={styles.tableContainer}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead style={{ width: "200px" }}>TASK DETAILS</TableHead>
            <TableHead style={{ width: "200px" }}>ASSIGNED STAFF</TableHead>
            <TableHead style={{ width: "120px" }}>START DATE</TableHead>
            <TableHead style={{ width: "120px" }}>END DATE</TableHead>
            <TableHead style={{ width: "100px" }}>PRIORITY</TableHead>
            <TableHead style={{ width: "120px" }}>TASK STATUS</TableHead>
            <TableHead style={{ width: "120px", textAlign: "right" }}>PROGRESS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                No active task tracking available.
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => (
              <TableRow key={task.assignment_id}>
                <TableCell>
                  <div>
                    <div className={styles.taskBold}>{task.task_name}</div>
                    <div className={styles.descSub}>{task.task_description}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className={styles.staffCell}>
                    <div className={styles.avatar}>{getInitials(task.staff_name)}</div>
                    <div>
                      <div className={styles.staffName}>{task.staff_name}</div>
                      <div className={styles.roleSub}>{task.role_name}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{task.start_date}</TableCell>
                <TableCell>{task.end_date}</TableCell>
                <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                <TableCell>{getStatusBadge(task.task_status)}</TableCell>
                <td style={{ textAlign: "right", fontWeight: 700 }} className="px-4 py-3">
                  {task.progress_percentage !== null ? `${task.progress_percentage}%` : "0%"}
                </td>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
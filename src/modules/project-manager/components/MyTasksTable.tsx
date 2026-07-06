"use client";

import React from "react";
import { Activity } from "lucide-react";
import Button from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { AssignedTask } from "../services/task.service";
import styles from "./MyTasksComponents.module.css";

interface MyTasksTableProps {
  tasks: AssignedTask[];
  onTrackClick: (task: AssignedTask) => void;
}

export default function MyTasksTable({ tasks, onTrackClick }: MyTasksTableProps) {
  
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
            <TableHead style={{ width: "240px" }}>TASK DETAILS</TableHead>
            <TableHead style={{ width: "130px" }}>DUE DATE</TableHead>
            <TableHead style={{ width: "110px" }}>PRIORITY</TableHead>
            <TableHead style={{ width: "120px", textAlign: "right" }}>PROGRESS</TableHead>
            <TableHead style={{ width: "130px" }}>STATUS</TableHead>
            <TableHead style={{ width: "120px", textAlign: "center" }}>ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                No assigned tasks available.
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
                <TableCell>{task.end_date}</TableCell>
                <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                <td style={{ textAlign: "right", fontWeight: 700 }} className="px-4 py-3">
                  {task.progress_percentage !== null ? `${task.progress_percentage}%` : "0%"}
                </td>
                <TableCell>{getStatusBadge(task.tracking_status)}</TableCell>
                <TableCell>
                  <div className={styles.actionGroup}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={styles.actionIconBtn}
                      onClick={() => onTrackClick(task)}
                    >
                      <Activity size={16} className="mr-1" /> Log Work
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
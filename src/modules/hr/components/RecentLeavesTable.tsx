"use client";

import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import styles from "./HRComponents.module.css";

export default function RecentLeavesTable() {
  const leaves = [
    { name: "Neha Gupta", role: "Project Manager", dept: "PROJECTS", type: "Sick Leave", status: "Pending", statusClass: styles.statusPending },
    { name: "Aryan Sharma", role: "Designer", dept: "DESIGNING", type: "Casual Leave", status: "Approved", statusClass: styles.statusCompleted },
    { name: "Kunal Sen", role: "Printer", dept: "PRINTING", type: "Medical Leave", status: "Approved", statusClass: styles.statusCompleted },
    { name: "Siddharth Roy", role: "Sales Executive", dept: "SALES", type: "Loss of Pay", status: "Rejected", statusClass: styles.statusDanger },
  ];

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableTitleRow}>
        <span className={styles.tableTitle}>PENDING LEAVE REQUESTS</span>
      </div>

      <div className={styles.tableContainer}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead style={{ width: "160px" }}>EMPLOYEE</TableHead>
              <TableHead>DEPARTMENT</TableHead>
              <TableHead style={{ width: "130px" }}>LEAVE TYPE</TableHead>
              <TableHead style={{ width: "130px" }}>STATUS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaves.map((item) => (
              <TableRow key={item.name}>
                <TableCell>
                  <div>
                    <div className={styles.staffNameBold}>{item.name}</div>
                    <div className={styles.staffSubRole}>{item.role}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={styles.deptBadge}>{item.dept}</span>
                </TableCell>
                <TableCell style={{ fontWeight: 600 }}>{item.type}</TableCell>
                <TableCell>
                  <span className={`${styles.badge} ${item.statusClass}`}>{item.status}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
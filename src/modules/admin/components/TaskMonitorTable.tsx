"use client";

import React, { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination"; // നിങ്ങളുടെ കോമൺ പേജിനേഷൻ ഇമ്പോർട്ട് ചെയ്യുന്നു
import { StaffSummary } from "../services/task.service";
import styles from "./TaskComponents.module.css";

interface TaskMonitorTableProps {
  summary: StaffSummary[];
}

export default function TaskMonitorTable({ summary }: TaskMonitorTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 5; // ഒരു പേജിൽ പരമാവധി 5 വരികൾ കാണിക്കുന്നു

  // അഡ്മിൻ ഫിൽട്ടറുകൾ മാറ്റുമ്പോൾ തനിയെ പേജ് ഒന്നിലേക്ക് റീസെറ്റ് ചെയ്യാനുള്ള ലോജിക്
  useEffect(() => {
    setCurrentPage(1);
  }, [summary.length]);

  const getDeptClass = (dept: string) => {
    const d = dept.toLowerCase();
    if (d === "sales") return styles.deptSales;
    if (d === "project manager") return styles.deptPm;
    if (d === "printing") return styles.deptPrinting;
    return styles.deptGeneral;
  };

  // പേജിനേഷൻ കണക്കുകൂട്ടലുകൾ
  const totalCount = summary.length;
  const startIndex = (currentPage - 1) * limit;
  const paginatedSummary = summary.slice(startIndex, startIndex + limit);

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableTitleRow}>
        <span className={styles.tableTitle}>TASK MONITOR</span>
      </div>

      <div className={styles.tableContainer}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead style={{ width: "180px" }}>DEPARTMENT</TableHead>
              <TableHead style={{ width: "260px" }}>ASSIGNED STAFF</TableHead>
              <TableHead className={styles.textCenter} style={{ width: "130px" }}>TOTAL TASKS</TableHead>
              <TableHead className={styles.textCenter} style={{ width: "130px" }}>COMPLETED</TableHead>
              <TableHead className={styles.textCenter} style={{ width: "130px" }}>PENDING</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSummary.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                  No operational records found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedSummary.map((staff) => (
                <TableRow key={staff.staff_id}>
                  <TableCell>
                    <span className={`${styles.deptBadge} ${getDeptClass(staff.role_name)}`}>
                      {staff.role_name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className={styles.staffNameBold}>{staff.staff_name}</div>
                    </div>
                  </TableCell>
                  <td className={`${styles.textCenter} ${styles.textBold}`}>{staff.total_tasks}</td>
                  <td className={styles.textCenter}>
                    <span className={styles.completedBubble}>{staff.completed_tasks}</span>
                  </td>
                  <td className={styles.textCenter}>
                    <span className={styles.pendingBubble}>{staff.pending_tasks}</span>
                  </td>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ഡൈനാമിക് പേജിനേഷൻ റോ ഇവിടെ നൽകുന്നു */}
      <div className={styles.paginationRow}>
        <div className={styles.resultsText}>
          Showing {totalCount > 0 ? startIndex + 1 : 0}-{Math.min(currentPage * limit, totalCount)} of {totalCount} Staff Members
        </div>
        <Pagination 
          total={totalCount} 
          limit={limit} 
          activePage={currentPage} 
          onPageChange={setCurrentPage} 
        />
      </div>
    </div>
  );
}
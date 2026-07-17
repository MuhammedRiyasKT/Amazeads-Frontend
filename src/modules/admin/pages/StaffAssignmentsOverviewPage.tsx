"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Clock, ClipboardList, CheckCircle2, AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import AssignmentDetailsModal from "../components/AssignmentDetailsModal";
import { getAssignmentsOverview, AssignmentOverviewItem, AssignmentFilters } from "../services/task.service";
import styles from "../components/TaskComponents.module.css";

interface StaffAssignmentsOverviewPageProps {
  staffId: number;
}

export default function StaffAssignmentsOverviewPage({ staffId }: StaffAssignmentsOverviewPageProps) {
  const [items, setItems] = useState<AssignmentOverviewItem[]>([]);
  const [staffName, setStaffName] = useState("");
  
  // സബ് പേജ് ടാബ് കറന്റ് മാസത്തിലേക്ക് ഡീഫോൾട്ട് ചെയ്യുന്നു (പ്രധാന മാറ്റം!)
  const [filterMode, setFilterMode] = useState<"today" | "week" | "month" | "year" | "all">("month");

  // പേജിനേഷൻ
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 5;

  // ടാസ്ക് മോഡൽ സ്റ്റേറ്റുകൾ
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const loadAssignments = () => {
    const apiFilters: AssignmentFilters = {
      staff_id: staffId,
      page: currentPage,
      page_size: limit,
    };

    const todayStr = new Date().toISOString().substring(0, 10);

    // ഡൈനാമിക് ആയി കറന്റ് മാസം/വർഷം എപിഐയിലേക്ക് അയക്കുന്നു
    if (filterMode === "today") {
      apiFilters.work_date = todayStr;
    } else if (filterMode === "week") {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      apiFilters.from_date = lastWeek.toISOString().substring(0, 10);
      apiFilters.to_date = todayStr;
    } else if (filterMode === "month") {
      apiFilters.month = new Date().getMonth() + 1;
      apiFilters.year = new Date().getFullYear();
    } else if (filterMode === "year") {
      apiFilters.year = new Date().getFullYear();
    }

    getAssignmentsOverview(apiFilters)
      .then((data) => {
        setItems(data.items || []);
        setTotalCount(data.pagination?.total_count || 0);
        if (data.items && data.items.length > 0) {
          setStaffName(data.items[0].staff_name);
        }
      })
      .catch((err) => console.error("Error loading staff assignments:", err));
  };

  useEffect(() => {
    loadAssignments();
  }, [staffId, currentPage, filterMode]);

  const handleAssignmentView = (assignmentId: number) => {
    setSelectedAssignmentId(assignmentId);
    setIsDetailsOpen(true);
  };

  const getPriorityBadge = (p: number) => {
    if (p === 3) return <span className="px-2 py-0.5 text-xs font-bold bg-red-50 text-red-600 rounded">High</span>;
    if (p === 2) return <span className="px-2 py-0.5 text-xs font-bold bg-amber-50 text-amber-600 rounded">Medium</span>;
    return <span className="px-2 py-0.5 text-xs font-bold bg-blue-50 text-blue-600 rounded">Low</span>;
  };

  const totalTasks = items.length;
  const completedTasks = items.reduce((acc, curr) => acc + curr.completed_count, 0);
  const pendingTasks = items.reduce((acc, curr) => acc + curr.pending_count, 0);
  const overdueTasks = items.reduce((acc, curr) => acc + (curr.overdue_count || 0), 0);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerRow}>
        <div className="flex items-center gap-3">
          <Link href="/admin/daily-tasks" passHref legacyBehavior>
            <button className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
              <ArrowLeft size={16} className="text-slate-600" />
            </button>
          </Link>
          <h1 className={styles.title}>{staffName || "Staff"}'s Tasks</h1>
        </div>
      </div>

      {/* Date Filter Tabs - 'Month' ഇവിടെ ഡീഫോൾട്ട് ആയി ആക്റ്റീവ് ആയിരിക്കും */}
      <div className={styles.filtersBox} style={{ justifyContent: "flex-end" }}>
        <div className={styles.tabsRow}>
          <button onClick={() => setFilterMode("all")} className={`${styles.tab} ${filterMode === "all" ? styles.tabActive : ""}`}>All</button>
          <button onClick={() => setFilterMode("today")} className={`${styles.tab} ${filterMode === "today" ? styles.tabActive : ""}`}>Today</button>
          <button onClick={() => setFilterMode("week")} className={`${styles.tab} ${filterMode === "week" ? styles.tabActive : ""}`}>Week</button>
          <button onClick={() => setFilterMode("month")} className={`${styles.tab} ${filterMode === "month" ? styles.tabActive : ""}`}>Month</button>
          <button onClick={() => setFilterMode("year")} className={`${styles.tab} ${filterMode === "year" ? styles.tabActive : ""}`}>Year</button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconCircle} ${styles.iconBlue}`}><ClipboardList size={20} /></div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Total Tasks</span>
            <strong className={styles.kpiValue}>{totalTasks}</strong>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconCircle} ${styles.iconGreen}`}><CheckCircle2 size={20} /></div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Completed</span>
            <strong className={styles.kpiValue} style={{ color: "#0ca678" }}>{completedTasks}</strong>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconCircle} ${styles.iconOrange}`}><Clock size={20} /></div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Pending</span>
            <strong className={styles.kpiValue} style={{ color: "#f76707" }}>{pendingTasks}</strong>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconCircle} ${styles.iconRed}`}><AlertTriangle size={20} /></div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Overdue</span>
            <strong className={styles.kpiValue} style={{ color: "#ef4444" }}>{overdueTasks}</strong>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: "160px" }}>TASK NAME</TableHead>
                <TableHead style={{ width: "160px" }}>DATES</TableHead>
                <TableHead style={{ width: "90px" }}>PRIORITY</TableHead>
                <TableHead style={{ width: "90px" }}>FLEXIBLE</TableHead>
                <TableHead style={{ width: "160px", textAlign: "center" }}>STATUS METRICS</TableHead>
                <TableHead style={{ width: "80px", textAlign: "center" }}>ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} style={{ textAlign: "center", padding: "24px" }}>
                    No assigned tasks found for this filter.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.assignment_id}>
                    <td className="font-bold text-slate-800 px-4 py-3">{item.task_name}</td>
                    <td>
                      <div className="text-xs text-slate-600">
                        {item.start_date} <span className="text-slate-400">to</span> {item.end_date}
                      </div>
                    </td>
                    <td>{getPriorityBadge(item.priority)}</td>
                    <td className="text-xs font-semibold">{item.flexible_status ? "Flexible" : "Standard"}</td>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded">Done: {item.completed_count}</span>
                        <span className="text-[10px] bg-amber-50 text-amber-600 font-bold px-1.5 py-0.5 rounded">Pend: {item.pending_count}</span>
                        <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-1.5 py-0.5 rounded">Over: {item.overdue_count}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <button 
                          onClick={() => handleAssignmentView(item.assignment_id)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className={styles.paginationRow}>
          <div className={styles.resultsText}>Showing {items.length} records</div>
          <Pagination total={totalCount} limit={limit} activePage={currentPage} onPageChange={setCurrentPage} />
        </div>
      </div>

      {/* ദിവസം തിരിച്ചുള്ള ട്രാക്കിംഗ് കാണിക്കുന്ന മോഡൽ */}
      {selectedAssignmentId && (
        <AssignmentDetailsModal
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedAssignmentId(null);
          }}
          assignmentId={selectedAssignmentId}
        />
      )}
    </div>
  );
}
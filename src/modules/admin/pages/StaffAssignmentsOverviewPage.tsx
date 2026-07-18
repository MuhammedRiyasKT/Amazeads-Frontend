"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Clock, ClipboardList, CheckCircle2, AlertTriangle, Search } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import AssignmentDetailsModal from "../components/AssignmentDetailsModal";
import { getAssignmentsOverview, AssignmentOverviewItem, AssignmentFilters } from "../services/task.service";
import styles from "../components/AdminComponents.module.css";

interface StaffAssignmentsOverviewPageProps {
  staffId: number;
}

export default function StaffAssignmentsOverviewPage({ staffId }: StaffAssignmentsOverviewPageProps) {
  const [items, setItems] = useState<AssignmentOverviewItem[]>([]);
  const [staffName, setStaffName] = useState("");
  
  // സബ് പേജ് ടാബ് കറന്റ് മാസത്തിലേക്ക് ഡീഫോൾട്ട് ചെയ്യുന്നു
  const [filterMode, setFilterMode] = useState<"today" | "week" | "month" | "year" | "all">("month");
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleFilterChange = (mode: "today" | "week" | "month" | "year" | "all") => {
    setFilterMode(mode);
    setCurrentPage(1);
  };

  const getPriorityBadge = (p: number) => {
    if (p === 3) return <span className="px-2 py-0.5 text-xs font-bold bg-red-50 text-red-600 rounded">High</span>;
    if (p === 2) return <span className="px-2 py-0.5 text-xs font-bold bg-amber-50 text-amber-600 rounded">Medium</span>;
    return <span className="px-2 py-0.5 text-xs font-bold bg-blue-50 text-blue-600 rounded">Low</span>;
  };

  const filteredItems = items.filter((item) =>
    item.task_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalTasks = filteredItems.length;
  const completedTasks = filteredItems.reduce((acc, curr) => acc + curr.completed_count, 0);
  const pendingTasks = filteredItems.reduce((acc, curr) => acc + curr.pending_count, 0);
  const overdueTasks = filteredItems.reduce((acc, curr) => acc + (curr.overdue_count || 0), 0);

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

      {/* Filters Box */}
      <div className={styles.filtersBox}>
        <div className={styles.searchWrapper} style={{ maxWidth: "280px" }}>
          <Search size={16} className={styles.searchIcon} />
          <Input
            type="text"
            placeholder="Search by task name..."
            className={styles.customInputOverride}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.tabsRow}>
          <button onClick={() => handleFilterChange("all")} className={`${styles.tab} ${filterMode === "all" ? styles.tabActive : ""}`}>All</button>
          <button onClick={() => handleFilterChange("today")} className={`${styles.tab} ${filterMode === "today" ? styles.tabActive : ""}`}>Today</button>
          <button onClick={() => handleFilterChange("week")} className={`${styles.tab} ${filterMode === "week" ? styles.tabActive : ""}`}>Week</button>
          <button onClick={() => handleFilterChange("month")} className={`${styles.tab} ${filterMode === "month" ? styles.tabActive : ""}`}>Month</button>
          <button onClick={() => handleFilterChange("year")} className={`${styles.tab} ${filterMode === "year" ? styles.tabActive : ""}`}>Year</button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className={styles.kpiGrid} style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {/* Total Tasks */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Total Tasks</span>
            <strong className={styles.kpiValue}>{totalTasks}</strong>
          </div>
          <div className={styles.kpiRight}>
            <div className={`${styles.kpiIconWrapper} ${styles.iconOrders}`}>
              <ClipboardList size={18} />
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Completed</span>
            <strong className={styles.kpiValue} style={{ color: "#0ca678" }}>{completedTasks}</strong>
          </div>
          <div className={styles.kpiRight}>
            <div className={`${styles.kpiIconWrapper} ${styles.iconRevenue}`}>
              <CheckCircle2 size={18} />
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Pending</span>
            <strong className={styles.kpiValue} style={{ color: "#f76707" }}>{pendingTasks}</strong>
          </div>
          <div className={styles.kpiRight}>
            <div className={`${styles.kpiIconWrapper} ${styles.iconProject}`}>
              <Clock size={18} />
            </div>
          </div>
        </div>

        {/* Overdue */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Overdue</span>
            <strong className={styles.kpiValue} style={{ color: "#ef4444" }}>{overdueTasks}</strong>
          </div>
          <div className={styles.kpiRight}>
            <div className={`${styles.kpiIconWrapper} ${styles.iconExpense}`}>
              <AlertTriangle size={18} />
            </div>
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
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} style={{ textAlign: "center", padding: "24px" }}>
                    No assigned tasks found for this filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.assignment_id}>
                    {/* 1. പഴയ <td> മാറ്റി ശരിയായ <TableCell> നൽകി (Borders ഉം ലൈനുകളും വരാൻ) */}
                    <TableCell className="font-bold text-slate-800">
                      {item.task_name}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-slate-600">
                        {item.start_date} <span className="text-slate-400">to</span> {item.end_date}
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(item.priority)}</TableCell>
                    <TableCell className="text-xs font-semibold">
                      {item.flexible_status ? "Flexible" : "Standard"}
                    </TableCell>
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
          <div className={styles.resultsText}>Showing {filteredItems.length} records</div>
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
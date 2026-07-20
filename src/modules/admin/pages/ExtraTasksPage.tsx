"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ClipboardList, CheckCircle2, Clock, AlertTriangle, Eye } from "lucide-react";
import Button from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import AssignOrCreateModal from "../components/AssignOrCreateModal";
import TaskFilters from "../components/TaskFilters";
import { getStaffFlexibleTaskSummary, assignOrCreateTask, StaffFlexibleSummary, CreateAndAssignPayload, SummaryFilters } from "../services/task.service";
import styles from "../components/TaskComponents.module.css";

export default function ExtraTasksPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<StaffFlexibleSummary[]>([]);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const currentMonth = (new Date().getMonth() + 1).toString();
  const currentYear = new Date().getFullYear().toString();
  const todayStr = new Date().toISOString().substring(0, 10);

  const [filterType, setFilterType] = useState<"all" | "day" | "range" | "month" | "year" | "staff">("day");
  const [searchQuery, setSearchQuery] = useState("");
  const [workDate, setWorkDate] = useState(todayStr);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedStaffId, setSelectedStaffId] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const limit = 5;

  const loadData = () => {
    const apiFilters: SummaryFilters = {};

    if ((filterType === "day" || filterType === "all") && workDate) {
      apiFilters.work_date = workDate;
    } else if (filterType === "range" && fromDate && toDate) {
      apiFilters.from_date = fromDate;
      apiFilters.to_date = toDate;
    } else if (filterType === "month" && selectedYear) {
      apiFilters.year = parseInt(selectedYear);
      if (selectedMonth) apiFilters.month = parseInt(selectedMonth);
    } else if (filterType === "year" && selectedYear) {
      apiFilters.year = parseInt(selectedYear);
    }

    if (selectedStaffId) {
      apiFilters.staff_id = parseInt(selectedStaffId);
    }

    getStaffFlexibleTaskSummary(apiFilters)
      .then((data) => {
        setSummary((data || []).filter((s) => s.role_name.toLowerCase() !== "admin"));
      })
      .catch((err) => console.error("Error loading flexible summary:", err));
  };

  useEffect(() => {
    loadData();
    setCurrentPage(1);
  }, [filterType, workDate, fromDate, toDate, selectedYear, selectedMonth, selectedStaffId]);

  const handleStaffViewClick = (staffId: number) => {
    const params = new URLSearchParams();
    params.set("filterType", filterType);
    if (filterType === "day" && workDate) params.set("workDate", workDate);
    if (filterType === "range") {
      if (fromDate) params.set("fromDate", fromDate);
      if (toDate) params.set("toDate", toDate);
    }
    if (selectedYear) params.set("year", selectedYear);
    if (selectedMonth) params.set("month", selectedMonth);

    router.push(`/admin/daily-tasks/extra-tasks/staff/${staffId}?${params.toString()}`);
  };

  const handleAssignOrCreate = (payload: CreateAndAssignPayload) => {
    assignOrCreateTask(payload)
      .then(() => {
        setIsAssignOpen(false);
        loadData();
      })
      .catch((err) => console.error(err));
  };

  const getDeptClass = (dept: string) => {
    const d = dept.toLowerCase();
    if (d === "sales") return styles.deptSales;
    if (d === "project manager") return styles.deptPm;
    if (d === "printing") return styles.deptPrinting;
    return styles.deptGeneral;
  };

  const totalExtraTasks = summary.reduce((acc, curr) => acc + curr.total_tasks, 0);
  const completedTasks = summary.reduce((acc, curr) => acc + curr.completed_tasks, 0);
  const pendingTasks = summary.reduce((acc, curr) => acc + curr.pending_tasks, 0);
  const overdueTasks = summary.reduce((acc, curr) => acc + curr.overdue_tasks, 0);

  const filteredSummary = summary.filter((s) =>
    s.staff_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCount = filteredSummary.length;
  const startIndex = (currentPage - 1) * limit;
  const paginatedSummary = filteredSummary.slice(startIndex, startIndex + limit);

  return (
    <div className={styles.container}>
      {/* 1. മധ്യഭാഗത്തേക്ക് മാറ്റിയതും വീതി കൂട്ടിയതുമായ ടാബ് സ്വിച്ചർ */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl select-none border border-slate-200/50 shadow-sm">
          <Link href="/admin/daily-tasks" passHref legacyBehavior>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-500 font-semibold hover:text-slate-800 hover:bg-slate-200/60 transition-all w-48 py-2.5 rounded-xl cursor-pointer justify-center text-sm"
            >
              Daily Tasks
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            className="bg-white text-slate-800 shadow-sm font-bold w-48 py-2.5 rounded-xl cursor-default justify-center text-sm"
          >
            Extra Tasks
          </Button>
        </div>
      </div>

      {/* 2. ഹെഡിംഗും ആക്ഷൻ ബട്ടണും */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Extra Tasks Status</h1>
          <p className="text-sm text-slate-500 mt-1">Create, assign and monitor extra/flexible tasks for staff.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsAssignOpen(true)} className="flex items-center gap-2">
          <Plus size={16} /> Assign Extra Task
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconCircle} ${styles.iconBlue}`}><ClipboardList size={20} /></div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>TOTAL EXTRA TASKS</span>
            <strong className={styles.kpiValue}>{totalExtraTasks}</strong>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconCircle} ${styles.iconGreen}`}><CheckCircle2 size={20} /></div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>COMPLETED</span>
            <strong className={styles.kpiValue} style={{ color: "#0ca678" }}>{completedTasks}</strong>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconCircle} ${styles.iconOrange}`}><Clock size={20} /></div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>PENDING</span>
            <strong className={styles.kpiValue} style={{ color: "#f76707" }}>{pendingTasks}</strong>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconCircle} ${styles.iconRed}`}><AlertTriangle size={20} /></div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>OVERDUE</span>
            <strong className={styles.kpiValue} style={{ color: "#ef4444" }}>{overdueTasks}</strong>
          </div>
        </div>
      </div>

      {/* ഫിൽട്ടറുകൾ */}
      <TaskFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterType={filterType}
        setFilterType={setFilterType}
        workDate={workDate}
        setWorkDate={setWorkDate}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedStaffId={selectedStaffId}
        setSelectedStaffId={setSelectedStaffId}
      />

      {/* ടേബിൾ */}
      <div className={styles.tableCard}>
        <div className={styles.tableTitleRow}>
          <span className={styles.tableTitle}>STAFF FLEXIBLE TASK MONITOR</span>
        </div>

        <div className={styles.tableContainer}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: "180px" }}>DEPARTMENT</TableHead>
                <TableHead style={{ width: "260px" }}>ASSIGNED STAFF</TableHead>
                <TableHead className={styles.textCenter} style={{ width: "130px" }}>TOTAL EXTRA TASKS</TableHead>
                <TableHead className={styles.textCenter} style={{ width: "130px" }}>COMPLETED</TableHead>
                <TableHead className={styles.textCenter} style={{ width: "130px" }}>PENDING</TableHead>
                <TableHead className={styles.textCenter} style={{ width: "130px" }}>OVERDUE</TableHead>
                <TableHead style={{ width: "90px", textAlign: "center" }}>ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSummary.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                    No flexible task records found.
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
                      <div className={styles.staffNameBold}>{staff.staff_name}</div>
                    </TableCell>
                    <TableCell className={styles.textCenter} style={{ fontWeight: 700 }}>{staff.total_tasks}</TableCell>
                    <TableCell className={styles.textCenter}>
                      <span className={styles.completedBubble}>{staff.completed_tasks}</span>
                    </TableCell>
                    <TableCell className={styles.textCenter}>
                      <span className={styles.pendingBubble}>{staff.pending_tasks}</span>
                    </TableCell>
                    <TableCell className={styles.textCenter}>
                      <span className="text-xs bg-red-50 text-red-600 font-bold px-2.5 py-1 rounded">{staff.overdue_tasks}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={styles.actionIconBtn}
                          onClick={() => handleStaffViewClick(staff.staff_id)}
                        >
                          <Eye size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className={styles.paginationRow}>
          <div className={styles.resultsText}>
            Showing {totalCount > 0 ? startIndex + 1 : 0}-{Math.min(currentPage * limit, totalCount)} of {totalCount} Staff Records
          </div>
          <Pagination total={totalCount} limit={limit} activePage={currentPage} onPageChange={setCurrentPage} />
        </div>
      </div>

      {/* മോഡൽ */}
      <AssignOrCreateModal 
        isOpen={isAssignOpen} 
        onClose={() => setIsAssignOpen(false)} 
        onSave={handleAssignOrCreate} 
      />
    </div>
  );
}
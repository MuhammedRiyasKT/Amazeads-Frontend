"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Search, ClipboardList, CheckCircle2, Clock, AlertTriangle, SlidersHorizontal } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import AssignOrCreateModal from "../components/AssignOrCreateModal";
import { getStaffFlexibleTaskSummary, assignOrCreateTask, StaffFlexibleSummary, CreateAndAssignPayload, SummaryFilters } from "../services/task.service";
import { getStaffs, Staff } from "../services/staff.service";
import styles from "../components/TaskComponents.module.css";

export default function ExtraTasksPage() {
  const [summary, setSummary] = useState<StaffFlexibleSummary[]>([]);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  // ഫിൽട്ടർ സ്റ്റേറ്റുകൾ
  const [filterType, setFilterType] = useState<"all" | "day" | "range" | "month" | "year" | "staff">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [workDate, setWorkDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState("");

  // പേജിനേഷൻ സ്റ്റേറ്റ്
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 5; // ഒരു പേജിൽ പരമാവധി 5 ജീവനക്കാർ

  const loadData = () => {
    const apiFilters: SummaryFilters = {};

    // ഡൈനാമിക് ആയി ക്വറി പാരാമീറ്ററുകൾ സെറ്റ് ചെയ്യുന്നു
    if (filterType === "day" && workDate) {
      apiFilters.work_date = workDate;
    } else if (filterType === "range" && fromDate && toDate) {
      apiFilters.from_date = fromDate;
      apiFilters.to_date = toDate;
    } else if (filterType === "month" && selectedYear) {
      apiFilters.year = parseInt(selectedYear);
      if (selectedMonth) apiFilters.month = parseInt(selectedMonth);
    } else if (filterType === "year" && selectedYear) {
      apiFilters.year = parseInt(selectedYear);
    } else if (filterType === "staff" && selectedStaffId) {
      apiFilters.staff_id = parseInt(selectedStaffId);
    }

    getStaffFlexibleTaskSummary(apiFilters)
      .then((data) => {
        setSummary((data || []).filter((s) => s.role_name.toLowerCase() !== "admin"));
      })
      .catch((err) => console.error("Error loading flexible summary:", err));
  };

  useEffect(() => {
    getStaffs().then((data) => setStaffs(data.filter((s) => s.role_name.toLowerCase() !== "admin"))).catch((err) => console.error(err));
  }, []);

  // ഏതെങ്കിലും ഫിൽട്ടറുകൾ മാറുമ്പോൾ റിയൽ-ടൈം എപിഐ റീലോഡ് ചെയ്യുന്നു
  useEffect(() => {
    loadData();
    setCurrentPage(1); // ഫിൽട്ടർ മാറുമ്പോൾ പേജ് 1 ലേക്ക് റീസെറ്റ് ചെയ്യുന്നു
  }, [filterType, workDate, fromDate, toDate, selectedYear, selectedMonth, selectedStaffId]);

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

  const handleFilterTypeChange = (type: any) => {
    setFilterType(type);
    setWorkDate("");
    setFromDate("");
    setToDate("");
    setSelectedMonth("");
    setSelectedStaffId("");
  };

  // എപിഐ വിവരങ്ങൾ വെച്ചുള്ള ഡൈനാമിക് കാർഡ് കണക്കുകൾ
  const totalExtraTasks = summary.reduce((acc, curr) => acc + curr.total_tasks, 0);
  const completedTasks = summary.reduce((acc, curr) => acc + curr.completed_tasks, 0);
  const pendingTasks = summary.reduce((acc, curr) => acc + curr.pending_tasks, 0);
  const overdueTasks = summary.reduce((acc, curr) => acc + curr.overdue_tasks, 0);

  // ഫ്രണ്ട്-എൻഡ് സെർച്ച് ഫിൽട്ടറിംഗ് ലോജിക്
  const filteredSummary = summary.filter((s) =>
    s.staff_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ടേബിൾ പേജിനേഷൻ ലോജിക്
  const totalCount = filteredSummary.length;
  const startIndex = (currentPage - 1) * limit;
  const paginatedSummary = filteredSummary.slice(startIndex, startIndex + limit);

  const months = [
    { label: "January", val: "1" }, { label: "February", val: "2" }, { label: "March", val: "3" },
    { label: "April", val: "4" }, { label: "May", val: "5" }, { label: "June", val: "6" },
    { label: "July", val: "7" }, { label: "August", val: "8" }, { label: "September", val: "9" },
    { label: "October", val: "10" }, { label: "November", val: "11" }, { label: "December", val: "12" },
  ];

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
          <h1 className={styles.title}>Extra / Flexible Tasks</h1>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsAssignOpen(true)} className="flex items-center gap-2">
          <Plus size={16} /> Assign Extra Task
        </Button>
      </div>

      {/* KPI Cards Grid - dynamic counts */}
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

      {/* Dynamic Filters Row */}
      <div className={styles.filtersBox}>
        <div className={styles.searchWrapper} style={{ maxWidth: "260px" }}>
          <Search size={16} className={styles.searchIcon} />
          <Input
            type="text"
            placeholder="Search by staff..."
            className={styles.customInputOverride}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 justify-end flex-wrap">
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal size={14} className="text-slate-500" />
            <select value={filterType} onChange={(e) => handleFilterTypeChange(e.target.value)} className={styles.filterSelect}>
              <option value="all">All Extra Tasks</option>
              <option value="day">Single Day</option>
              <option value="range">Date Range</option>
              <option value="month">Monthly & Yearly</option>
              <option value="staff">Specific Staff</option>
            </select>
          </div>

          {filterType === "day" && (
            <input type="date" value={workDate} onChange={(e) => setWorkDate(e.target.value)} className={styles.dateInput} />
          )}

          {filterType === "range" && (
            <div className="flex items-center gap-2">
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={styles.dateInput} />
              <span className="text-xs font-semibold text-slate-400">to</span>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={styles.dateInput} />
            </div>
          )}

          {filterType === "month" && (
            <div className="flex items-center gap-2">
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className={styles.filterSelect}>
                <option value="">Select Month</option>
                {months.map((m) => <option key={m.val} value={m.val}>{m.label}</option>)}
              </select>
              <input type="number" placeholder="Year" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className={styles.dateInput} style={{ width: "100px" }} />
            </div>
          )}

          {filterType === "staff" && (
            <select value={selectedStaffId} onChange={(e) => setSelectedStaffId(e.target.value)} className={styles.filterSelect}>
              <option value="">Choose Staff</option>
              {staffs.map((s) => <option key={s.id} value={s.id}>{s.staff_name}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Extra Tasks List Card */}
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSummary.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
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
                    <td className={`${styles.textCenter} ${styles.textBold}`}>{staff.total_tasks}</td>
                    <td className={styles.textCenter}>
                      <span className={styles.completedBubble}>{staff.completed_tasks}</span>
                    </td>
                    <td className={styles.textCenter}>
                      <span className={styles.pendingBubble}>{staff.pending_tasks}</span>
                    </td>
                    <td className={styles.textCenter}>
                      <span className="text-xs bg-red-50 text-red-600 font-bold px-2.5 py-1 rounded">{staff.overdue_tasks}</span>
                    </td>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Dynamic Pagination (5 items per page) */}
        <div className={styles.paginationRow}>
          <div className={styles.resultsText}>
            Showing {totalCount > 0 ? startIndex + 1 : 0}-{Math.min(currentPage * limit, totalCount)} of {totalCount} Staff Records
          </div>
          <Pagination total={totalCount} limit={limit} activePage={currentPage} onPageChange={setCurrentPage} />
        </div>
      </div>

      <AssignOrCreateModal 
        isOpen={isAssignOpen} 
        onClose={() => setIsAssignOpen(false)} 
        onSave={handleAssignOrCreate} 
      />
    </div>
  );
}
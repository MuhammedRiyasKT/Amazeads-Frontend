"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, User, SlidersHorizontal } from "lucide-react";
import Button from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import { getAssignmentsOverview, AssignmentOverviewItem, getDailyTasks, DailyTask, AssignmentFilters } from "../services/task.service";
import { getStaffs, Staff } from "../services/staff.service";
import styles from "../components/TaskComponents.module.css";

export default function AssignmentsOverviewPage() {
  const [items, setItems] = useState<AssignmentOverviewItem[]>([]);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);

  // എപിഐ ഫിൽട്ടർ സ്റ്റേറ്റുകൾ
  const [filterType, setFilterType] = useState<"all" | "day" | "range" | "month" | "priority" | "status" | "staff" | "task">("all");
  const [workDate, setWorkDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState("");

  // പേജിനേഷൻ സ്റ്റേറ്റുകൾ
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5; // എപിഐ ക്വറിയിൽ കൊടുത്ത പേജ് സൈസ്

  // ഫിൽട്ടറുകൾ ലോഡ് ചെയ്യാൻ സ്റ്റാഫും ടാസ്കുകളും എടുക്കുന്നു
  useEffect(() => {
    getStaffs().then((data) => setStaffs(data.filter((s) => s.role_name.toLowerCase() !== "admin"))).catch((err) => console.error(err));
    getDailyTasks().then((data) => setTasks(data)).catch((err) => console.error(err));
  }, []);

  const loadAssignments = () => {
    const apiFilters: AssignmentFilters = {
      page: currentPage,
      page_size: limit
    };

    // ബാക്ക്-എൻഡ് ഏപിഐ പാരാമീറ്ററുകൾ ഡൈനാമിക് ആയി സജ്ജീകരിക്കുന്നു
    if (filterType === "day" && workDate) {
      apiFilters.work_date = workDate;
    } else if (filterType === "range" && fromDate && toDate) {
      apiFilters.from_date = fromDate;
      apiFilters.to_date = toDate;
    } else if (filterType === "month" && selectedYear) {
      apiFilters.year = parseInt(selectedYear);
      if (selectedMonth) apiFilters.month = parseInt(selectedMonth);
    } else if (filterType === "priority" && priority) {
      apiFilters.priority = parseInt(priority);
    } else if (filterType === "status" && status) {
      apiFilters.assignment_status = status;
    } else if (filterType === "staff" && selectedStaffId) {
      apiFilters.staff_id = parseInt(selectedStaffId);
    } else if (filterType === "task" && selectedTaskId) {
      apiFilters.task_id = parseInt(selectedTaskId);
    }

    getAssignmentsOverview(apiFilters)
      .then((data) => {
        setItems(data.items || []);
        setTotalCount(data.pagination?.total_count || 0);
        setTotalPages(data.pagination?.total_pages || 1);
      })
      .catch((err) => console.error("Error loading assignments:", err));
  };

  // ഏതെങ്കിലും ഫിൽട്ടറുകളോ പേജോ മാറുമ്പോൾ തനിയെ എപിഐ വഴി ടേബിൾ റീലോഡ് ചെയ്യും
  useEffect(() => {
    loadAssignments();
  }, [currentPage, filterType, workDate, fromDate, toDate, selectedYear, selectedMonth, priority, status, selectedStaffId, selectedTaskId]);

  const handleFilterTypeChange = (type: any) => {
    setFilterType(type);
    setCurrentPage(1); // ഫിൽട്ടർ മാറുമ്പോൾ പേജ് 1 ലേക്ക് റീസെറ്റ് ചെയ്യും
    
    // പഴയ ലോക്കൽ സ്റ്റേറ്റുകൾ ക്ലിയർ ചെയ്യുന്നു
    setWorkDate("");
    setFromDate("");
    setToDate("");
    setPriority("");
    setStatus("");
    setSelectedStaffId("");
    setSelectedTaskId("");
  };

  const getPriorityBadge = (p: number) => {
    if (p === 3) return <span className={`${styles.badge} ${styles.priorityHigh}`}>High</span>;
    if (p === 2) return <span className={`${styles.badge} ${styles.priorityMedium}`}>Medium</span>;
    return <span className={`${styles.badge} ${styles.priorityLow}`}>Low</span>;
  };

  const getDeptClass = (dept: string) => {
    const d = dept.toLowerCase();
    if (d === "sales") return styles.deptSales;
    if (d === "project manager") return styles.deptPm;
    if (d === "printing") return styles.deptPrinting;
    return styles.deptGeneral;
  };

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
        <div>
          <div className="flex items-center gap-3">
            <Link href="/admin/daily-tasks" passHref legacyBehavior>
              <button className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                <ArrowLeft size={16} className="text-slate-600" />
              </button>
            </Link>
            <h1 className={styles.title}>All Assigned Tasks</h1>
          </div>
          <p className={styles.subtitle} style={{ marginLeft: "42px" }}>
            Comprehensive overview of weekly schedules, priorities, and staff assignments.
          </p>
        </div>
      </div>

      {/* ഡൈനാമിക് എപിഐ ഫിൽട്ടർ പാനൽ */}
      <div className={styles.filtersBox}>
        <div className={styles.filterControls}>
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 uppercase">
            <SlidersHorizontal size={14} /> Filter By:
          </span>
          <select
            value={filterType}
            onChange={(e) => handleFilterTypeChange(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">No Filters (All)</option>
            <option value="day">Single Day</option>
            <option value="range">Date Range</option>
            <option value="month">Monthly & Yearly</option>
            <option value="priority">Priority Level</option>
            <option value="status">Assignment Status</option>
            <option value="staff">Specific Staff Member</option>
            <option value="task">Specific Task Template</option>
          </select>
        </div>

        {/* തിരഞ്ഞെടുക്കുന്ന ഫിൽട്ടർ രീതിക്കനുസരിച്ച് മാറുന്ന ഡൈനാമിക് ഇൻപുട്ടുകൾ */}
        <div className="flex items-center gap-3 justify-end flex-wrap">
          {/* A. Single Day */}
          {filterType === "day" && (
            <input type="date" value={workDate} onChange={(e) => setWorkDate(e.target.value)} className={styles.dateInput} />
          )}

          {/* B. Date Range */}
          {filterType === "range" && (
            <div className="flex items-center gap-2">
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={styles.dateInput} />
              <span className="text-xs font-semibold text-slate-400">to</span>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={styles.dateInput} />
            </div>
          )}

          {/* C. Month / Year */}
          {filterType === "month" && (
            <div className="flex items-center gap-2">
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className={styles.filterSelect}>
                <option value="">Choose Month</option>
                {months.map((m) => <option key={m.val} value={m.val}>{m.label}</option>)}
              </select>
              <input type="number" placeholder="Year" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className={styles.dateInput} style={{ width: "100px" }} />
            </div>
          )}

          {/* D. Priority */}
          {filterType === "priority" && (
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className={styles.filterSelect}>
              <option value="">Choose Priority</option>
              <option value="1">Low</option>
              <option value="2">Medium</option>
              <option value="3">High</option>
            </select>
          )}

          {/* E. Status */}
          {filterType === "status" && (
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={styles.filterSelect}>
              <option value="">Choose Status</option>
              <option value="active">Active</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
            </select>
          )}

          {/* F. Staff member */}
          {filterType === "staff" && (
            <select value={selectedStaffId} onChange={(e) => setSelectedStaffId(e.target.value)} className={styles.filterSelect}>
              <option value="">Choose Staff Member</option>
              {staffs.map((s) => <option key={s.id} value={s.id}>{s.staff_name}</option>)}
            </select>
          )}

          {/* G. Task Template */}
          {filterType === "task" && (
            <select value={selectedTaskId} onChange={(e) => setSelectedTaskId(e.target.value)} className={styles.filterSelect}>
              <option value="">Choose Task Template</option>
              {tasks.map((t) => <option key={t.id} value={t.id}>{t.task_name}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: "90px" }}>ID</TableHead>
                <TableHead style={{ width: "220px" }}>TASK DETAILS</TableHead>
                <TableHead style={{ width: "240px" }}>ASSIGNED STAFF</TableHead>
                <TableHead style={{ width: "130px" }}>START DATE</TableHead>
                <TableHead style={{ width: "130px" }}>END DATE</TableHead>
                <TableHead style={{ width: "100px" }}>PRIORITY</TableHead>
                <TableHead className={styles.textCenter} style={{ width: "120px" }}>COMPLETED</TableHead>
                <TableHead className={styles.textCenter} style={{ width: "110px" }}>PENDING</TableHead>
                <TableHead style={{ width: "120px" }}>STATUS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                    No assigned tasks match the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.assignment_id}>
                    <TableCell style={{ fontWeight: 700, color: "#1e56a0" }}>
                      #ASN-{item.assignment_id}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className={styles.taskBold}>{item.task_name}</div>
                        <div className={styles.descSub}>{item.task_description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={styles.staffCell}>
                        <div className={styles.avatar}>
                          <User size={14} />
                        </div>
                        <div>
                          <div className={styles.staffName}>{item.staff_name}</div>
                          <span className={`${styles.deptBadge} ${getDeptClass(item.role_name)}`} style={{ transform: "scale(0.85)", marginLeft: "-4px" }}>
                            {item.role_name}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{item.start_date}</TableCell>
                    <TableCell>{item.end_date}</TableCell>
                    <TableCell>{getPriorityBadge(item.priority)}</TableCell>
                    <td className={styles.textCenter}>
                      <span className={styles.completedBubble}>{item.completed_count}</span>
                    </td>
                    <td className={styles.textCenter}>
                      <span className={styles.pendingBubble}>{item.pending_count}</span>
                    </td>
                    <TableCell>
                      <span className={`${styles.badge} ${item.assignment_status.toLowerCase() === "active" ? styles.statusCompleted : styles.statusProgress}`}>
                        {item.assignment_status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Dynamic Pagination */}
        <div className={styles.paginationRow}>
          <div className={styles.resultsText}>
            Showing {items.length > 0 ? (currentPage - 1) * limit + 1 : 0}–{Math.min(currentPage * limit, totalCount)} of {totalCount} assigned tasks
          </div>
          <Pagination
            total={totalCount}
            limit={limit}
            activePage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
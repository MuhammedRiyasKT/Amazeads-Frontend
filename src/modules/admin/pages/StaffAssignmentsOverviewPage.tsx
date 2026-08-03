"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation"; // യുആർഎൽ പാരാമീറ്ററുകൾ റീഡ് ചെയ്യാൻ ഇമ്പോർട്ട് ചെയ്യുന്നു
import { ArrowLeft, Eye, Clock, ClipboardList, CheckCircle2, AlertTriangle, Search } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import AssignmentDetailsModal from "../components/AssignmentDetailsModal";
import { getAssignmentsOverview, AssignmentOverviewItem, AssignmentFilters, getStaffTaskSummary } from "../services/task.service"; // getStaffTaskSummary ഇമ്പോർട്ട് ഇവിടെ ശരിയാക്കി!
import styles from "../components/AdminComponents.module.css"; // AdminComponents ഇമ്പോർട്ട് ചെയ്യുന്നു

interface StaffAssignmentsOverviewPageProps {
  staffId: number;
}

export default function StaffAssignmentsOverviewPage({ staffId }: StaffAssignmentsOverviewPageProps) {
  const searchParams = useSearchParams(); // searchParams ഡിക്ലയർ ചെയ്യുന്നു
  const [items, setItems] = useState<AssignmentOverviewItem[]>([]);
  const [staffName, setStaffName] = useState("");
  
  // കറന്റ് വർഷവും മാസവും ഇന്നത്തെ തീയതിയും കണ്ടെത്തുന്നു
  const currentMonth = (new Date().getMonth() + 1).toString();
  const currentYear = new Date().getFullYear().toString();

  type FilterMode = "today" | "week" | "month" | "year" | "all" | "day" | "range";

  // ഫിൽട്ടർ സ്റ്റേറ്റുകൾ കറന്റ് മാസത്തിലേക്ക് ഡീഫോൾട്ട് ചെയ്യുന്നു (ഡീഫോൾട്ട് 'today' ആക്കിയത്)
  const [filterMode, setFilterMode] = useState<FilterMode>("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [workDate, setWorkDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // പേജിനേഷൻ
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 5;

  // ടാസ്ക് കാർഡുകൾക്ക് വേണ്ടിയുള്ള റിയൽ-ടൈം കൗണ്ട് സ്റ്റേറ്റുകൾ
  const [kpis, setKpis] = useState({ total: 0, completed: 0, pending: 0, overdue: 0 });

  // ടാസ്ക് മോഡൽ സ്റ്റേറ്റുകൾ
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // 1. പേജ് മൗണ്ട് ചെയ്യുമ്പോൾ മെയിൻ പേജിൽ നിന്നും വന്ന URL ഫിൽട്ടർ വിവരങ്ങൾ പേജിലേക്ക് സിങ്ക് ചെയ്യുന്നു
  useEffect(() => {
    if (typeof window !== "undefined") {
      const paramFilterType = searchParams.get("filterType") as any;
      const paramWorkDate = searchParams.get("workDate");
      const paramFromDate = searchParams.get("fromDate");
      const paramToDate = searchParams.get("toDate");
      const paramYear = searchParams.get("year");
      const paramMonth = searchParams.get("month");

      // സ്റ്റേറ്റുകൾ അപ്ഡേറ്റ് ചെയ്യുന്നു
      if (paramFilterType) setFilterMode(paramFilterType === "day" ? "today" : paramFilterType === "range" ? "week" : paramFilterType);
      if (paramWorkDate) setWorkDate(paramWorkDate);
      if (paramFromDate) setFromDate(paramFromDate);
      if (paramToDate) setToDate(paramToDate);
      if (paramYear) setSelectedYear(paramYear);
      if (paramMonth) setSelectedMonth(paramMonth);
    }
  }, [searchParams]);

  const loadAssignments = () => {
    const apiFilters: AssignmentFilters = {
      staff_id: staffId,
      page: currentPage,
      page_size: limit,
      flexible_status: false,
    };

    const todayStr = new Date().toISOString().substring(0, 10);

    if (filterMode === "today" || filterMode === "day") {
      apiFilters.work_date = workDate || todayStr;
    } else if (filterMode === "week" || filterMode === "range") {
      if (fromDate && toDate) {
        apiFilters.from_date = fromDate;
        apiFilters.to_date = toDate;
      } else {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        apiFilters.from_date = lastWeek.toISOString().substring(0, 10);
        apiFilters.to_date = todayStr;
      }
    } else if (filterMode === "month" && selectedYear) {
      apiFilters.year = parseInt(selectedYear);
      if (selectedMonth) apiFilters.month = parseInt(selectedMonth);
    } else if (filterMode === "year" && selectedYear) {
      apiFilters.year = parseInt(selectedYear);
    }

    getAssignmentsOverview(apiFilters)
      .then((data: any) => {
        setItems(data.items || []);
        setTotalCount(data.pagination?.total_count || 0);
        if (data.items && data.items.length > 0) {
          setStaffName(data.items[0].staff_name);
        }
      })
      .catch((err: any) => console.error("Error loading staff assignments:", err));

    // അഡ്മിൻ എക്സ്ട്രാ ടാസ്കിൽ ചെയ്തതുപോലെ റിയൽ-ടൈം സമ്മറി കാർഡുകൾക്കായി getStaffFlexibleTaskSummary എപിഐ വിളിക്കുന്നു (പ്രധാന മാറ്റം!)
    getStaffTaskSummary({
      staff_id: staffId,
      ...(apiFilters.work_date && { work_date: apiFilters.work_date }),
      ...(apiFilters.from_date && { from_date: apiFilters.from_date, to_date: apiFilters.to_date }),
      ...(apiFilters.month && { month: apiFilters.month, year: apiFilters.year }),
      ...(apiFilters.year && !apiFilters.month && { year: apiFilters.year }),
    })
      .then((summaryList: any[]) => { // ടൈപ്പ് എറർ പരിഹരിച്ചു
        const staff = (summaryList || []).find((s) => s.staff_id === staffId);
        if (staff) {
          setKpis({
            total: staff.total_tasks,
            completed: staff.completed_tasks,
            pending: staff.pending_tasks,
            overdue: staff.overdue_tasks || 0
          });
        } else {
          setKpis({ total: 0, completed: 0, pending: 0, overdue: 0 });
        }
      })
      .catch((err: any) => console.error("Error loading staff KPI summary:", err)); // ടൈപ്പ് എറർ പരിഹരിച്ചു
  };

  useEffect(() => {
    loadAssignments();
  }, [staffId, currentPage, filterMode, workDate, fromDate, toDate, selectedYear, selectedMonth]);

  const handleAssignmentView = (assignmentId: number) => {
    setSelectedAssignmentId(assignmentId);
    setIsDetailsOpen(true);
  };

  const handleFilterChange = (mode: any) => {
    setFilterMode(mode);
    setCurrentPage(1);

    // പഴയ സ്റ്റേറ്റുകൾ റീസെറ്റ് ചെയ്യുന്നു
    setWorkDate("");
    setFromDate("");
    setToDate("");
  };

  const getPriorityBadge = (p: number) => {
    if (p === 3) return <span className="px-2 py-0.5 text-xs font-bold bg-red-50 text-red-600 rounded">High</span>;
    if (p === 2) return <span className="px-2 py-0.5 text-xs font-bold bg-amber-50 text-amber-600 rounded">Medium</span>;
    return <span className="px-2 py-0.5 text-xs font-bold bg-blue-50 text-blue-600 rounded">Low</span>;
  };

  // ഫ്രണ്ട്-എൻഡ് സെർച്ച് ഫിൽട്ടറിംഗ്
  const filteredItems = items.filter((item) =>
    item.task_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const months = [
    { label: "Jan", val: "1" }, { label: "Feb", val: "2" }, { label: "Mar", val: "3" },
    { label: "Apr", val: "4" }, { label: "May", val: "5" }, { label: "Jun", val: "6" },
    { label: "Jul", val: "7" }, { label: "Aug", val: "8" }, { label: "Sep", val: "9" },
    { label: "Oct", val: "10" }, { label: "Nov", val: "11" }, { label: "Dec", val: "12" },
  ];

  const dateTabs = [
    { label: "Today", val: "day" as const },
    { label: "Week", val: "range" as const },
    { label: "Month", val: "month" as const },
    { label: "Year", val: "year" as const },
    { label: "All", val: "all" as const }
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
          <h1 className={styles.title}>{staffName || "Staff"}'s Tasks</h1>
        </div>
      </div>

      {/* 2. ഫിൽട്ടറുകൾ പില്ലുകളാക്കി അപ്ഡേറ്റ് ചെയ്തത് */}
      <div className={styles.filtersBox}>
        <div className={styles.searchWrapper} style={{ maxWidth: "280px" }}>
          <Search size={16} className={styles.searchIcon} />
          <Input
            type="text"
            placeholder="Search by extra task..."
            className={styles.customInputOverride}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 justify-end flex-wrap">
          {/* പില്ലുകൾ */}
          <div className={styles.tabsRow} style={{ padding: "3px", borderRadius: "8px", gap: "4px" }}>
            {dateTabs.map((tab) => (
              <button
                key={tab.val}
                type="button"
                className={`${styles.tab} ${filterMode === tab.val || (tab.val === "day" && filterMode === "today") || (tab.val === "range" && filterMode === "week") ? styles.tabActive : ""}`}
                onClick={() => handleFilterChange(tab.val === "day" ? "today" : tab.val === "range" ? "week" : tab.val)}
                style={{ padding: "6px 14px", fontSize: "0.78rem" }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ഡൈനാമിക് തീയതി ഇൻപുട്ടുകൾ */}
          <div className="flex items-center gap-2">
            {(filterMode === "day" || filterMode === "today") && (
              <input type="date" value={workDate} onChange={(e) => setWorkDate(e.target.value)} className={styles.dateInput} style={{ height: "34px", fontSize: "0.78rem" }} />
            )}

            {(filterMode === "range" || filterMode === "week") && (
              <div className="flex items-center gap-1.5">
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={styles.dateInput} style={{ height: "34px", fontSize: "0.78rem", width: "110px" }} />
                <span className="text-[10px] font-bold text-slate-400">to</span>
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={styles.dateInput} style={{ height: "34px", fontSize: "0.78rem", width: "110px" }} />
              </div>
            )}

            {filterMode === "month" && (
              <div className="flex items-center gap-1.5">
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className={styles.filterSelect} style={{ height: "34px", padding: "0 8px", fontSize: "0.78rem" }}>
                  <option value="">Month</option>
                  {months.map((m) => <option key={m.val} value={m.val}>{m.label}</option>)}
                </select>
                <input type="number" placeholder="Year" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className={styles.dateInput} style={{ height: "34px", fontSize: "0.78rem", width: "70px" }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className={styles.kpiGrid} style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {/* Total Tasks */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Total Tasks</span>
            <strong className={styles.kpiValue}>{kpis.total}</strong>
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
            <strong className={styles.kpiValue} style={{ color: "#0ca678" }}>{kpis.completed}</strong>
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
            <strong className={styles.kpiValue}>{kpis.pending}</strong>
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
            <strong className={styles.kpiValue}>{kpis.overdue}</strong>
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
                    No assigned extra tasks found for this filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.assignment_id}>
                    <TableCell className="font-bold text-slate-800">
                      {item.task_name}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-slate-600">
                        {item.start_date} <span className="text-slate-400">to</span> {item.end_date}
                      </div>
                    </TableCell>
                    {/* ടേബിൾ സെൽ ഇമ്പോർട്ട് ടാഗ് കറക്റ്റ് ചെയ്ത ഭാഗം (പ്രധാന തിരുത്ത്!) */}
                    <TableCell>{getPriorityBadge(item.priority)}</TableCell>
                    <TableCell className="text-xs font-semibold">{item.flexible_status ? "Flexible" : "Standard"}</TableCell>
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
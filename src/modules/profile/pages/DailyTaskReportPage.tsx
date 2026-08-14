"use client";

import React, { useEffect, useState } from "react";
import { ClipboardList, CheckCircle2, Clock, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { getPersonalAssignments, PersonalAssignment, PersonalFilters } from "../services/profile.service";
import { useAuthStore } from "@/store/authStore";
import ViewAssignmentModal from "../components/ViewAssignmentModal";
import styles from "../components/ProfileComponents.module.css";

// ─── Date Formatter Helper ──────────────────────────────────────────────────
function formatAssignmentPeriod(startDateStr: string, endDateStr: string): string {
  if (!startDateStr) return "—";
  
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      
      const day = String(date.getDate()).padStart(2, "0");
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = monthNames[date.getMonth()];
      return `${day} ${month}`;
    } catch {
      return dateStr;
    }
  };

  const formattedStart = formatDate(startDateStr);
  if (!endDateStr || startDateStr === endDateStr) {
    return formattedStart;
  }
  
  const formattedEnd = formatDate(endDateStr);
  return `${formattedStart} – ${formattedEnd}`;
}

export default function DailyTaskReportPage() {
  const [items, setItems] = useState<PersonalAssignment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // മോഡൽ സ്റ്റേറ്റുകൾ
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<PersonalAssignment | null>(null);

  // ഫിൽട്ടർ പില്ലുകളുടെ സ്റ്റേറ്റ് (Today, This Week, This Month, This Year, All)
  const [filterMode, setFilterMode] = useState<"today" | "week" | "month" | "year" | "all">("all");

  const user = useAuthStore((state) => state.user);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);

  const pageSize = 5; // ഒരു പേജിൽ കാണിക്കുന്ന ഐറ്റങ്ങൾ

  const loadReportData = () => {
    if (!user) return;

    const apiFilters: PersonalFilters = {
      page: currentPage,
      page_size: pageSize
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

    getPersonalAssignments(user.id, user.role_name, apiFilters)
      .then((data) => {
        setItems(data.items || []);
        setTotalCount(data.pagination?.total_count || (data.items || []).length);
      })
      .catch((err) => console.error("Error loading personal report:", err));
  };

  useEffect(() => {
    if (_hasHydrated && user) {
      loadReportData();
    }
  }, [_hasHydrated, user, currentPage, filterMode]);

  if (!_hasHydrated || !user) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-650" />
      </div>
    );
  }

  const totalTasks = items.reduce((acc, curr) => acc + curr.total_scheduled_in_range, 0);
  const completedTasks = items.reduce((acc, curr) => acc + curr.completed_count, 0);
  const pendingTasks = items.reduce((acc, curr) => acc + curr.pending_count, 0);
  const successRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 🎯 Dynamic Pagination Calculations
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handleViewClick = (assignment: PersonalAssignment) => {
    setSelectedAssignment(assignment);
    setIsModalOpen(true);
  };

  const handleFilterChange = (mode: "today" | "week" | "month" | "year" | "all") => {
    setFilterMode(mode);
    setCurrentPage(1);
  };

  return (
    <div className={styles.container}>
      {/* 1. ഹെഡർ റോ */}
      <div className={styles.headerSection}>
        <h1 className={styles.welcomeText}>My Task Report</h1>
        <div className={styles.staffMetaRow}>
          <span className="text-xs font-semibold text-slate-500">
            Track your assigned tasks, schedules and completion status.
          </span>
        </div>
      </div>

      {/* 2. KPI Grid */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard} style={{ borderLeft: "4px solid #1c7ed6" }}>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>TOTAL TASKS</span>
            <strong className={styles.kpiValue}>{totalTasks}</strong>
            <span className={styles.kpiSubtextBlue}>Range Total</span>
          </div>
          <div className={`${styles.kpiIconCircle} ${styles.iconBlue}`}>
            <ClipboardList size={22} />
          </div>
        </div>

        <div className={styles.kpiCard} style={{ borderLeft: "4px solid #0ca678" }}>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>COMPLETED</span>
            <strong className={styles.kpiValue} style={{ color: "#0ca678" }}>{completedTasks}</strong>
            <span className={styles.kpiSubtextGreen}>{successRate}% Success Rate</span>
          </div>
          <div className={`${styles.kpiIconCircle} ${styles.iconTeal}`}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className={styles.kpiCard} style={{ borderLeft: "4px solid #fa5252" }}>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>PENDING</span>
            <strong className={styles.kpiValue} style={{ color: "#fa5252" }}>{pendingTasks}</strong>
            <span className={styles.kpiSubtextRed}>Needs Resolution</span>
          </div>
          <div className={`${styles.kpiIconCircle} ${styles.iconRed}`}>
            <Clock size={22} />
          </div>
        </div>
      </div>

      {/* 3. Date Filter Tabs */}
      <div className={styles.filterOptionsRow}>
        <div className={styles.filterTabs}>
          <button onClick={() => handleFilterChange("all")} className={`${styles.filterTab} ${filterMode === "all" ? styles.filterTabActive : ""}`}>All</button>
          <button onClick={() => handleFilterChange("today")} className={`${styles.filterTab} ${filterMode === "today" ? styles.filterTabActive : ""}`}>Today</button>
          <button onClick={() => handleFilterChange("week")} className={`${styles.filterTab} ${filterMode === "week" ? styles.filterTabActive : ""}`}>This Week</button>
          <button onClick={() => handleFilterChange("month")} className={`${styles.filterTab} ${filterMode === "month" ? styles.filterTabActive : ""}`}>This Month</button>
          <button onClick={() => handleFilterChange("year")} className={`${styles.filterTab} ${filterMode === "year" ? styles.filterTabActive : ""}`}>This Year</button>
        </div>
      </div>

      {/* 4. Report Table Container */}
      <div className={styles.scheduleCard}>
        {/* 💻 DESKTOP TABLE VIEW (>= md / 768px) */}
        <div className="hidden md:block overflow-x-auto w-full">
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "140px" }}>DATE</th>
                <th>TASK</th>
                <th className={styles.textCenter} style={{ width: "120px" }}>SCHEDULED</th>
                <th className={styles.textCenter} style={{ width: "120px" }}>COMPLETED</th>
                <th className={styles.textCenter} style={{ width: "120px", cursor: "help" }} title="Pending: Scheduled occurrences that have not been completed.">
                  PENDING <span className="text-[10px] text-slate-400">ⓘ</span>
                </th>
                <th className={styles.textCenter} style={{ width: "120px", cursor: "help" }} title="Overdue: Scheduled occurrences that were not completed by their expected date.">
                  OVERDUE <span className="text-[10px] text-slate-400">ⓘ</span>
                </th>
                <th style={{ width: "100px", textAlign: "center" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "#94a3b8" }}>
                    No submission records available for this filter.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.assignment_id}>
                    <td style={{ fontWeight: 700, color: "#1e293b", whiteSpace: "nowrap" }}>
                      {formatAssignmentPeriod(item.start_date, item.end_date)}
                    </td>
                    <td>
                      <div>
                        <div className={styles.taskBold}>{item.task_name}</div>
                        <div className={styles.taskSub}>
                          {item.task_description ? item.task_description.replace(/\r?\n/g, " ") : "No description provided."}
                        </div>
                      </div>
                    </td>
                    <td className={styles.textCenter} style={{ fontWeight: 700, color: "#1e293b" }} title={item.total_scheduled_in_range === 0 ? "No scheduled occurrences in this period." : undefined}>
                      {item.total_scheduled_in_range === 0 ? "—" : item.total_scheduled_in_range}
                    </td>
                    <td className={styles.textCenter} style={{ fontWeight: 800, color: "#10b981" }}>
                      {item.completed_count}
                    </td>
                    <td className={styles.textCenter} style={{ fontWeight: 800, color: "#f59e0b" }}>
                      {item.pending_count}
                    </td>
                    <td className={styles.textCenter} style={{ fontWeight: 800, color: "#f43f5e" }}>
                      {item.overdue_count ?? 0}
                    </td>
                    <td>
                      <div className="flex items-center justify-center">
                        <button 
                          className={styles.actionIconBtn}
                          onClick={() => handleViewClick(item)}
                          title="View Task Details"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 📱 MOBILE CARDS VIEW (< md / 768px) 🌟 */}
        <div className="block md:hidden p-3 space-y-3 w-full">
          {items.length === 0 ? (
            <div className="text-center py-8 text-xs font-semibold text-slate-400 bg-slate-50/50 rounded-xl border border-slate-200 p-4">
              No submission records available for this filter.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.assignment_id}
                className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-3 w-full min-w-0"
              >
                {/* Top Row: Date on Left, View Action on Right */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-extrabold text-xs text-slate-900">
                    {formatAssignmentPeriod(item.start_date, item.end_date)}
                  </span>
                  <button
                    onClick={() => handleViewClick(item)}
                    title="View Task Details"
                    className="flex items-center gap-1 text-xs font-bold text-indigo-650 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-205 transition-colors cursor-pointer"
                  >
                    <Eye size={13} /> View Details
                  </button>
                </div>

                {/* Task Title & Description */}
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {item.task_name}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-2">
                    {item.task_description ? item.task_description.replace(/\r?\n/g, " ") : "No description provided."}
                  </p>
                </div>

                {/* Counts Grid: Scheduled, Completed, Pending, Overdue */}
                <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-center text-xs">
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block truncate">
                      Scheduled
                    </span>
                    <span className="font-extrabold text-slate-800 text-xs block truncate mt-0.5">
                      {item.total_scheduled_in_range === 0 ? "—" : item.total_scheduled_in_range}
                    </span>
                  </div>

                  <div className="min-w-0 border-l border-slate-200 px-1">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block truncate">
                      Completed
                    </span>
                    <span className="font-extrabold text-emerald-600 text-xs block truncate mt-0.5">
                      {item.completed_count}
                    </span>
                  </div>

                  <div className="min-w-0 border-l border-slate-200 px-1">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block truncate">
                      Pending
                    </span>
                    <span className="font-extrabold text-amber-600 text-xs block truncate mt-0.5">
                      {item.pending_count}
                    </span>
                  </div>

                  <div className="min-w-0 border-l border-slate-200 px-1">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block truncate">
                      Overdue
                    </span>
                    <span className="font-extrabold text-rose-600 text-xs block truncate mt-0.5">
                      {item.overdue_count ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 🌟 Dynamic Pagination Footer */}
        <div className={styles.paginationRow}>
          <div className={styles.resultsText}>
            Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalCount} total records)
          </div>

          <div className={styles.pageList}>
            {/* Previous Page Button */}
            <button 
              className={styles.pageBtn}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Page Number Buttons [1] [2] [3]... */}
            {pageNumbers.map((pageNum) => (
              <button
                key={pageNum}
                className={`${styles.pageBtn} ${currentPage === pageNum ? styles.pageActive : ""}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}

            {/* Next Page Button */}
            <button 
              className={styles.pageBtn}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages || items.length < pageSize}
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* View Assignment Modal */}
      <ViewAssignmentModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAssignment(null);
        }}
        assignment={selectedAssignment}
      />
    </div>
  );
}
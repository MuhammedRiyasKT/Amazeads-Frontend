"use client";

import React, { useEffect, useState } from "react";
import { ClipboardList, CheckCircle2, Clock, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { getPersonalAssignments, PersonalAssignment, PersonalFilters } from "../services/profile.service";
import { useAuthStore } from "@/store/authStore";
import ViewAssignmentModal from "../components/ViewAssignmentModal";
import styles from "../components/ProfileComponents.module.css";

export default function DailyTaskReportPage() {
  const [items, setItems] = useState<PersonalAssignment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // മോഡൽ സ്റ്റേറ്റുകൾ
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<PersonalAssignment | null>(null);

  // ഫിൽട്ടർ പില്ലുകളുടെ സ്റ്റേറ്റ് (Today, Week, Month, Year, All)
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
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
        <h1 className={styles.welcomeText}>Daily Task Reports</h1>
        <div className={styles.staffMetaRow}>
          <span className={styles.metaBadge}>Monitor staff task progress and completion reports</span>
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
          <button onClick={() => handleFilterChange("week")} className={`${styles.filterTab} ${filterMode === "week" ? styles.filterTabActive : ""}`}>Week</button>
          <button onClick={() => handleFilterChange("month")} className={`${styles.filterTab} ${filterMode === "month" ? styles.filterTabActive : ""}`}>Month</button>
          <button onClick={() => handleFilterChange("year")} className={`${styles.filterTab} ${filterMode === "year" ? styles.filterTabActive : ""}`}>Year</button>
        </div>
      </div>

      {/* 4. Report Table */}
      <div className={styles.scheduleCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "140px" }}>DATE</th>
                <th>TASK DETAILS</th>
                <th className={styles.textCenter} style={{ width: "160px" }}>TOTAL SCHEDULED</th>
                <th className={styles.textCenter} style={{ width: "140px" }}>COMPLETED</th>
                <th className={styles.textCenter} style={{ width: "140px" }}>PENDING</th>
                <th style={{ width: "100px", textAlign: "center" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#94a3b8" }}>
                    No submission records available for this filter.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.assignment_id}>
                    <td style={{ fontWeight: 700, color: "#1e293b", whiteSpace: "nowrap" }}>{item.start_date}</td>
                    <td>
                      <div>
                        <div className={styles.taskBold}>{item.task_name}</div>
                        <div className={styles.taskSub}>{item.task_description || "NIL"}</div>
                      </div>
                    </td>
                    <td className={styles.textCenter} style={{ fontWeight: 700, color: "#1e293b" }}>{item.total_scheduled_in_range}</td>
                    <td className={styles.textCenter} style={{ fontWeight: 800, color: "#0ca678" }}>{item.completed_count}</td>
                    <td className={styles.textCenter} style={{ fontWeight: 800, color: "#fa5252" }}>{item.pending_count}</td>
                    <td>
                      <div className="flex items-center justify-center">
                        <button 
                          className={styles.actionIconBtn}
                          onClick={() => handleViewClick(item)}
                          title="View Details"
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
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

  // ലോക്കൽസ്റ്റോറേജിൽ നിന്നും എടുക്കാനുള്ള ഡൈനാമിക് സ്റ്റേറ്റുകൾ
  const [staffId, setStaffId] = useState<number>(5);
  const [userRole, setUserRole] = useState<string>("sales");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedId = localStorage.getItem("staffId");
      const savedRole = localStorage.getItem("userRole");
      if (savedId) setStaffId(parseInt(savedId));
      if (savedRole) setUserRole(savedRole);
    }
  }, []);

  const loadReportData = () => {
    const apiFilters: PersonalFilters = {
      page: currentPage,
      page_size: 5
    };

    const todayStr = new Date().toISOString().substring(0, 10);

    // തിരഞ്ഞെടുക്കുന്ന ഫിൽട്ടർ മോഡ് അനുസരിച്ച് തീയതികൾ സജ്ജീകരിക്കുന്നു
    if (filterMode === "today") {
      apiFilters.work_date = todayStr;
    } else if (filterMode === "week") {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      apiFilters.from_date = lastWeek.toISOString().substring(0, 10);
      apiFilters.to_date = todayStr;
    } else if (filterMode === "month") {
      apiFilters.month = new Date().getMonth() + 1; // 1-12
      apiFilters.year = new Date().getFullYear();
    } else if (filterMode === "year") {
      apiFilters.year = new Date().getFullYear();
    }

    // പ്രിന്റിംഗ് / പ്രൊജക്റ്റ് മാനേജർക്ക് അനുസരിച്ചുള്ള ശരിയായ നോൺ-അഡ്മിൻ എപിഐ കോൾ ചെയ്യുന്നു
    getPersonalAssignments(staffId, userRole, apiFilters)
      .then((data) => {
        setItems(data.items || []);
        setTotalCount(data.pagination?.total_count || 0);
      })
      .catch((err) => console.error("Error loading personal report:", err));
  };

  // ഫിൽട്ടറുകളോ പേജോ മാറുമ്പോൾ തനിയെ എപിഐ വഴി വിവരങ്ങൾ അപ്ഡേറ്റ് ആകും
  useEffect(() => {
    if (staffId && userRole) {
      loadReportData();
    }
  }, [staffId, userRole, currentPage, filterMode]);

  // എപിഐ വിവരങ്ങളിൽ നിന്നുള്ള തൽസമയ കാർഡ് കൗണ്ടുകൾ
  const totalTasks = items.reduce((acc, curr) => acc + curr.total_scheduled_in_range, 0);
  const completedTasks = items.reduce((acc, curr) => acc + curr.completed_count, 0);
  const pendingTasks = items.reduce((acc, curr) => acc + curr.pending_count, 0);
  const successRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // ഐക്കൺ ക്ലിക്ക് ചെയ്യുമ്പോൾ ഡാറ്റ ലോഡ് ചെയ്തു മോഡൽ കാണിക്കുന്നു
  const handleViewClick = (assignment: PersonalAssignment) => {
    setSelectedAssignment(assignment);
    setIsModalOpen(true);
  };

  const handleFilterChange = (mode: "today" | "week" | "month" | "year" | "all") => {
    setFilterMode(mode);
    setCurrentPage(1); // ഫിൽട്ടർ മാറുമ്പോൾ പേജ് 1 ആക്കുന്നു
  };

  return (
    <div className={styles.container}>
      {/* 1. പുതിയ ഹെഡിങ് റോ ഇവിടെ ചേർത്തിരിക്കുന്നു (പ്രധാന മാറ്റം) */}
      <div>
          <h1 className={styles.welcomeText}>Daily Task Reports</h1>
          <div className={styles.staffMetaRow}>
            <span className={styles.metaBadge}>Monitor staff task progress and completion reports</span>
          </div>
        </div>
        
      {/* Date Filter Tabs */}
      <div className={styles.filterOptionsRow}>
        <div className={styles.filterTabs}>
          <button onClick={() => handleFilterChange("all")} className={`${styles.filterTab} ${filterMode === "all" ? styles.filterTabActive : ""}`}>All</button>
          <button onClick={() => handleFilterChange("today")} className={`${styles.filterTab} ${filterMode === "today" ? styles.filterTabActive : ""}`}>Today</button>
          <button onClick={() => handleFilterChange("week")} className={`${styles.filterTab} ${filterMode === "week" ? styles.filterTabActive : ""}`}>Week</button>
          <button onClick={() => handleFilterChange("month")} className={`${styles.filterTab} ${filterMode === "month" ? styles.filterTabActive : ""}`}>Month</button>
          <button onClick={() => handleFilterChange("year")} className={`${styles.filterTab} ${filterMode === "year" ? styles.filterTabActive : ""}`}>Year</button>
        </div>
      </div>

      {/* KPI Grid - എപിഐയിൽ നിന്നും ഡൈനാമിക് ആയി ഗണിച്ചെടുത്ത കൗണ്ടുകൾ */}
      <div className={styles.kpiGrid}>
        <div className={`${styles.kpiCard} ${styles.kpiCardGray}`} style={{ borderLeft: "4px solid #1c7ed6" }}>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>TOTAL TASKS</span>
            <strong className={styles.kpiValue}>{totalTasks}</strong>
            <span className={styles.kpiSubtextUp}>Range Total</span>
          </div>
          <div className={`${styles.kpiIconCircle} ${styles.iconBlue}`} style={{ backgroundColor: "#e7f5ff", color: "#1c7ed6" }}>
            <ClipboardList size={20} />
          </div>
        </div>

        <div className={`${styles.kpiCard} ${styles.kpiCardGray}`} style={{ borderLeft: "4px solid #0ca678" }}>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>COMPLETED</span>
            <strong className={styles.kpiValue} style={{ color: "#0ca678" }}>{completedTasks}</strong>
            <span className={styles.kpiSubtextUp}>{successRate}% Success Rate</span>
          </div>
          <div className={`${styles.kpiIconCircle} ${styles.iconTeal}`}>
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className={`${styles.kpiCard} ${styles.kpiCardGray}`} style={{ borderLeft: "4px solid #fa5252" }}>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>PENDING</span>
            <strong className={styles.kpiValue} style={{ color: "#fa5252" }}>{pendingTasks}</strong>
            <span className={styles.kpiSubtextMuted} style={{ color: "#fa5252" }}>Needs Resolution</span>
          </div>
          <div className={`${styles.kpiIconCircle} ${styles.iconOrange}`} style={{ backgroundColor: "#fff5f5", color: "#fa5252" }}>
            <Clock size={20} />
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div className={styles.scheduleCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "150px" }}>DATE</th>
                <th style={{ width: "240px" }}>TASK DETAILS</th>
                <th className={styles.textCenter} style={{ width: "180px" }}>TOTAL SCHEDULED</th>
                <th className={styles.textCenter} style={{ width: "150px" }}>COMPLETED</th>
                <th className={styles.textCenter} style={{ width: "150px" }}>PENDING</th>
                <th style={{ width: "120px", textAlign: "center" }}>ACTION</th>
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
                    <td style={{ fontWeight: 700, color: "#1e293b" }}>{item.start_date}</td>
                    <td>
                      <div>
                        <div className={styles.taskBold}>{item.task_name}</div>
                        <div className={styles.taskSub}>{item.task_description}</div>
                      </div>
                    </td>
                    <td className={styles.textCenter} style={{ fontWeight: 600 }}>{item.total_scheduled_in_range}</td>
                    <td className={styles.textCenter} style={{ fontWeight: 700, color: "#0ca678" }}>{item.completed_count}</td>
                    <td className={styles.textCenter} style={{ fontWeight: 700, color: "#fa5252" }}>{item.pending_count}</td>
                    <td>
                      <div className="flex items-center justify-center">
                        <button 
                          className={styles.actionIconBtn}
                          onClick={() => handleViewClick(item)}
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

        {/* Pagination Footer */}
        <div className={styles.paginationRow}>
          <div className={styles.resultsText}>Showing recent submissions</div>
          <div className={styles.pageList}>
            <button 
              className={styles.pageBtn}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </button>
            <button className={`${styles.pageBtn} ${styles.pageActive}`}>{currentPage}</button>
            <button 
              className={styles.pageBtn}
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={items.length < 5}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* സിംഗിൾ അസൈൻമെന്റ് വിവരങ്ങൾ കാണാനുള്ള പുതിയ മോഡൽ */}
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
"use client";

import React, { useEffect, useState } from "react";
import { Plus, PlusCircle, ListCollapse } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import TaskKPIs from "../components/TaskKPIs";
import TaskFilters from "../components/TaskFilters";
import TaskMonitorTable from "../components/TaskMonitorTable";
import AssignOrCreateModal from "../components/AssignOrCreateModal";
import { 
  getStaffTaskSummary,
  assignOrCreateTask,
  StaffSummary,
  CreateAndAssignPayload,
  SummaryFilters
} from "../services/task.service";
import styles from "../components/TaskComponents.module.css";

export default function DailyTasksPage() {
  const [staffSummary, setStaffSummary] = useState<StaffSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  // 1. കറന്റ് വർഷവും മാസവും ഡൈനാമിക് ആയി കണ്ടെത്തുന്നു
  const currentMonth = (new Date().getMonth() + 1).toString(); // e.g. "7"
  const currentYear = new Date().getFullYear().toString();     // e.g. "2026"

  // API ഫിൽട്ടർ സ്റ്റേറ്റുകൾ കറന്റ് മാസത്തിലേക്ക് ഡീഫോൾട്ട് ചെയ്യുന്നു (പ്രധാന മാറ്റം!)
  const [filterType, setFilterType] = useState<"all" | "day" | "range" | "month" | "year" | "staff">("month");
  const [workDate, setWorkDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedYear, setSelectedYear] = useState(currentYear); // ഡീഫോൾട്ട് ആയി കറന്റ് വർഷം
  const [selectedMonth, setSelectedMonth] = useState(currentMonth); // ഡീഫോൾട്ട് ആയി കറന്റ് മാസം
  const [selectedStaffId, setSelectedStaffId] = useState("");

  const loadPageData = () => {
    const apiFilters: SummaryFilters = {};

    if (filterType === "day" && workDate) {
      apiFilters.work_date = workDate;
    } else if (filterType === "range" && fromDate && toDate) {
      apiFilters.from_date = fromDate;
      apiFilters.to_date = toDate;
    } else if (filterType === "month" && selectedYear) {
      apiFilters.year = parseInt(selectedYear);
      if (selectedMonth) {
        apiFilters.month = parseInt(selectedMonth);
      }
    } else if (filterType === "year" && selectedYear) {
      apiFilters.year = parseInt(selectedYear);
    } else if (filterType === "staff" && selectedStaffId) {
      apiFilters.staff_id = parseInt(selectedStaffId);
    }

    getStaffTaskSummary(apiFilters)
      .then((data) => {
        const filteredData = (Array.isArray(data) ? data : []).filter(
          (s) => s.role_name.toLowerCase() !== "admin"
        );
        setStaffSummary(filteredData);
      })
      .catch((err) => console.error("Error loading task summary:", err));
  };

  useEffect(() => {
    loadPageData();
  }, [filterType, workDate, fromDate, toDate, selectedYear, selectedMonth, selectedStaffId]);

  const handleAssignOrCreate = (payload: CreateAndAssignPayload) => {
    assignOrCreateTask(payload)
      .then(() => {
        setIsAssignOpen(false);
        loadPageData();
      })
      .catch((err) => console.error(err));
  };

  const handleCreateExtraTask = () => {
    alert("Extra task dummy creation triggered successfully!");
  };

  const filteredSummary = staffSummary.filter((s) => {
    if (selectedDept && s.role_name.toLowerCase() !== selectedDept.toLowerCase()) return false;

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      return s.staff_name.toLowerCase().includes(query) || s.role_name.toLowerCase().includes(query);
    }

    return true;
  });

  return (
    <div className={styles.container}>
      {/* Header Row */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Daily Task Management</h1>
          <p className={styles.subtitle}>Create, assign and monitor daily operational tasks for all staff members.</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="outline" size="sm" onClick={handleCreateExtraTask} className="flex items-center gap-2">
            <PlusCircle size={16} /> Create Extra Task
          </Button>
          
          <Link href="/admin/daily-tasks/assignments" passHref legacyBehavior>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              All Assigned Tasks
            </Button>
          </Link>

          <Button variant="primary" size="sm" onClick={() => setIsAssignOpen(true)} className="flex items-center gap-2">
            <Plus size={16} /> Create Daily Task
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <TaskKPIs summary={staffSummary} />

      {/* ഡൈനാമിക് ഫിൽട്ടർ പാനൽ */}
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

      {/* ടാസ്ക് മോണിറ്റർ ടേബിൾ */}
      <TaskMonitorTable summary={filteredSummary} />

      {/* സിംഗിൾ കൺസോളിഡേറ്റഡ് മോഡൽ */}
      <AssignOrCreateModal 
        isOpen={isAssignOpen} 
        onClose={() => setIsAssignOpen(false)} 
        onSave={handleAssignOrCreate} 
      />
    </div>
  );
}
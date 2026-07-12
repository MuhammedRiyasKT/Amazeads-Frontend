"use client";

import React, { useEffect, useState } from "react";
import { Plus, PlusCircle, ListCollapse } from "lucide-react";
import Button from "@/components/ui/Button";
import TaskKPIs from "../components/TaskKPIs"; // പുതിയ കാർഡ് ഡാറ്റ പ്രോപ്സ് വഴി എടുക്കുന്നു
import TaskFilters from "../components/TaskFilters";
import TaskMonitorTable from "../components/TaskMonitorTable";
import AssignOrCreateModal from "../components/AssignOrCreateModal";
import Link from "next/link";
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
  const [workDate, setWorkDate] = useState("2026-07-09");
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  // ഫിൽട്ടർ സ്റ്റേറ്റുകൾ
  const [filterType, setFilterType] = useState<"all" | "day" | "range" | "month" | "year" | "staff">("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedMonth, setSelectedMonth] = useState("7");
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

           {/* പുതിയ അസൈൻഡ് ടാസ്ക് ലിസ്റ്റിലേക്കുള്ള ലിങ്ക് ബട്ടൺ */}
          <Link href="/admin/daily-tasks/assignments" passHref legacyBehavior>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ListCollapse size={16} /> All Assigned Tasks
            </Button>
          </Link>
          <Button variant="primary" size="sm" onClick={() => setIsAssignOpen(true)} className="flex items-center gap-2">
            <Plus size={16} /> Create Daily Task
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid - തിരുത്തിയെഴുതിയ റിയൽ ടാസ്ക് പ്രോപ്സ് */}
      <TaskKPIs summary={staffSummary} />

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
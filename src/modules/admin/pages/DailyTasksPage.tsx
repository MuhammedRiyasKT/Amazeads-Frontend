"use client";

import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [staffSummary, setStaffSummary] = useState<StaffSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const currentMonth = (new Date().getMonth() + 1).toString();
  const currentYear = new Date().getFullYear().toString();
  const todayStr = new Date().toISOString().substring(0, 10);

  const [filterType, setFilterType] = useState<"all" | "day" | "range" | "month" | "year" | "staff">("day");
  const [workDate, setWorkDate] = useState(todayStr);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
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
    }

    if (selectedStaffId) {
      apiFilters.staff_id = parseInt(selectedStaffId);
    }

    getStaffTaskSummary(apiFilters)
      .then((data) => {
        const filteredData = (Array.isArray(data) ? data : []).filter(
          (s) => s.role_name.toLowerCase() !== "admin" && s.role_name.toLowerCase() !== "manager"
        );
        setStaffSummary(filteredData);
      })
      .catch((err) => console.error("Error loading task summary:", err));
  };

  useEffect(() => {
    loadPageData();
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

    router.push(`/admin/daily-tasks/staff/${staffId}?${params.toString()}`);
  };

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
      {/* 1. മധ്യഭാഗത്തേക്ക് മാറ്റിയതും വീതി കൂട്ടിയതുമായ ടാബ് സ്വിച്ചർ */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl select-none border border-slate-200/50 shadow-sm">
          <Button 
            variant="ghost" 
            size="sm" 
            className="bg-white text-slate-800 shadow-sm font-bold w-48 py-2.5 rounded-xl cursor-default justify-center text-sm"
          >
            Daily Tasks
          </Button>
          <Link href="/admin/daily-tasks/extra-tasks" passHref legacyBehavior>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-500 font-semibold hover:text-slate-800 hover:bg-slate-200/60 transition-all w-48 py-2.5 rounded-xl cursor-pointer justify-center text-sm"
            >
              Extra Tasks
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. ഹെഡിംഗും ആക്ഷൻ ബട്ടണും */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Daily Tasks Status</h1>
          <p className="text-sm text-slate-500 mt-1">Create, assign and monitor daily operational tasks for staff.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsAssignOpen(true)} className="flex items-center gap-2">
          <Plus size={16} /> Create Daily Task
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <TaskKPIs summary={staffSummary} />

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
      <TaskMonitorTable summary={filteredSummary} onStaffViewClick={handleStaffViewClick} />

      {/* ക്രിയേറ്റ് മോഡൽ */}
      <AssignOrCreateModal 
        isOpen={isAssignOpen} 
        onClose={() => setIsAssignOpen(false)} 
        onSave={handleAssignOrCreate} 
      />
    </div>
  );
}
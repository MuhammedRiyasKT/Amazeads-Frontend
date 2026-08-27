// src/modules/hr/pages/HROverviewPage.tsx

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Calendar, RefreshCw, AlertCircle } from "lucide-react";
import HROverviewKpiCards from "../components/HROverviewKpiCards";
import DailyTasksSummary from "../components/DailyTasksSummary";
import AttendanceSummary from "../components/AttendanceSummary";
import RecentLeaveRequests from "../components/RecentLeaveRequests";
import UpcomingHolidays from "../components/UpcomingHolidays";
import HRQuickActions from "../components/HRQuickActions";
import LeaveDetailsModal from "@/modules/leave/components/LeaveDetailsModal";

// Service Imports
import { getAttendanceLog, getHolidays } from "@/modules/hr/services/attendance.service";
import { getHRLeaves } from "@/modules/leave/services/leave.service";
import { getDailyTasksKpi } from "../services/kpi.service";

// Type Imports
import { Holiday, AttendanceResponse } from "@/modules/hr/types/attendance.types";
import { LeaveRequest } from "@/modules/leave/types";
import { DailyTasksKpi, DailyTasksKpiParams } from "../types/kpi.types";

export default function HROverviewPage() {
  // 1. Core State Definition
  const [attendance, setAttendance] = useState<AttendanceResponse | null>(null);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [pendingLeavesCount, setPendingLeavesCount] = useState<number>(0);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [tasksKpi, setTasksKpi] = useState<DailyTasksKpi | null>(null);

  // Loading States
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [loadingLeaves, setLoadingLeaves] = useState(true);
  const [loadingHolidays, setLoadingHolidays] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // Error States
  const [errorAttendance, setErrorAttendance] = useState(false);
  const [errorLeaves, setErrorLeaves] = useState(false);
  const [errorHolidays, setErrorHolidays] = useState(false);
  const [errorTasks, setErrorTasks] = useState(false);

  // Modal States
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  // Active Task Filters state
  const [tasksFilterParams, setTasksFilterParams] = useState<DailyTasksKpiParams>({
    month: String(new Date().getMonth() + 1).padStart(2, "0"),
    year: new Date().getFullYear(),
  });

  // Today Date Reference
  const getTodayDateString = () => {
    const d = new Date();
    const YYYY = d.getFullYear();
    const MM = String(d.getMonth() + 1).padStart(2, "0");
    const DD = String(d.getDate()).padStart(2, "0");
    return `${YYYY}-${MM}-${DD}`;
  };

  const getTodayDisplayLabel = () => {
    return new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // 2. Fetch Handlers
  const fetchAttendance = useCallback(async () => {
    setLoadingAttendance(true);
    setErrorAttendance(false);
    try {
      const todayStr = getTodayDateString();
      const res = await getAttendanceLog({ date: todayStr });
      setAttendance(res);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setErrorAttendance(true);
    } finally {
      setLoadingAttendance(false);
    }
  }, []);

  const fetchLeaves = useCallback(async () => {
    setLoadingLeaves(true);
    setErrorLeaves(false);
    try {
      const res = await getHRLeaves({ page: 1, page_size: 50 });
      const items = res?.items || [];
      setLeaves(items);

      // Calculate pending count from all loaded items
      const pending = items.filter((l) => l.status === "Pending" || l.status === "HR Approved" || l.status === "Manager Approved").length;
      setPendingLeavesCount(pending);
    } catch (err) {
      console.error("Error fetching leaves:", err);
      setErrorLeaves(true);
    } finally {
      setLoadingLeaves(false);
    }
  }, []);

  const fetchHolidays = useCallback(async () => {
    setLoadingHolidays(true);
    setErrorHolidays(false);
    try {
      const res = await getHolidays({ page: 1, page_size: 50, year: new Date().getFullYear() });
      setHolidays(res?.items || res?.data || []);
    } catch (err) {
      console.error("Error fetching holidays:", err);
      setErrorHolidays(true);
    } finally {
      setLoadingHolidays(false);
    }
  }, []);

  const fetchTasksKpi = useCallback(async (params: DailyTasksKpiParams) => {
    setLoadingTasks(true);
    setErrorTasks(false);
    try {
      const res = await getDailyTasksKpi(params);
      setTasksKpi(res);
    } catch (err) {
      console.error("Error fetching tasks KPI:", err);
      setErrorTasks(true);
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  // Fetch all dashboard data concurrently
  const refreshAll = useCallback(() => {
    fetchAttendance();
    fetchLeaves();
    fetchHolidays();
    fetchTasksKpi(tasksFilterParams);
  }, [fetchAttendance, fetchLeaves, fetchHolidays, fetchTasksKpi, tasksFilterParams]);

  // Init fetch on load
  useEffect(() => {
    refreshAll();
  }, []);

  // Handler for custom task filtering
  const handleTaskFilterChange = (params: DailyTasksKpiParams) => {
    setTasksFilterParams(params);
    fetchTasksKpi(params);
  };

  // Prioritize pending leaves and display up to 5 items
  const getDisplayLeaves = () => {
    const pending = leaves.filter((l) => l.status === "Pending" || l.status === "HR Approved" || l.status === "Manager Approved");
    const other = leaves.filter((l) => l.status !== "Pending" && l.status !== "HR Approved" && l.status !== "Manager Approved");

    const sorted = [...pending, ...other];
    return sorted.slice(0, 5);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 py-6 w-full animate-fadeIn font-sans">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">HR Overview</h1>
          <p className="text-xs text-slate-500 font-medium">Control center to monitor staff attendance, leaves, and daily task workflows.</p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          <span className="flex items-center gap-2 bg-slate-50 border border-slate-205 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-600 shadow-3xs select-none">
            <Calendar size={14} className="text-indigo-600 animate-pulse" />
            Today: {getTodayDisplayLabel()}
          </span>

          <button
            type="button"
            onClick={refreshAll}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white hover:bg-slate-900 border border-slate-900 rounded-xl text-xs font-bold shadow-2xs cursor-pointer select-none transition-colors"
          >
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>
      </div>

      {/* Top 4-column KPI Cards Grid */}
      <HROverviewKpiCards
        presentCount={attendance?.total_present ?? 0}
        absentCount={attendance?.total_absent ?? 0}
        pendingLeavesCount={pendingLeavesCount}
        totalTasksCount={tasksKpi?.total_tasks ?? 0}
        loadingAttendance={loadingAttendance}
        loadingLeaves={loadingLeaves}
        loadingTasks={loadingTasks}
        errorAttendance={errorAttendance}
        errorLeaves={errorLeaves}
        errorTasks={errorTasks}
        onRetryAttendance={fetchAttendance}
        onRetryLeaves={fetchLeaves}
        onRetryTasks={() => fetchTasksKpi(tasksFilterParams)}
      />

      {/* Main Dashboard Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

        {/* Left Side: Daily Tasks Summary - spans 6 columns on desktop (equal-width) */}
        <div className="lg:col-span-6">
          <DailyTasksSummary
            kpi={tasksKpi}
            loading={loadingTasks}
            error={errorTasks}
            onFetch={handleTaskFilterChange}
          />
        </div>

        {/* Right Side: Attendance Breakdown - spans 6 columns on desktop (equal-width) */}
        <div className="lg:col-span-6">
          <AttendanceSummary
            presentCount={attendance?.total_present ?? 0}
            absentCount={attendance?.total_absent ?? 0}
            leaveCount={attendance?.total_leave ?? 0}
            halfDayCount={attendance?.total_half_day ?? 0}
            loading={loadingAttendance}
            error={errorAttendance}
            onRetry={fetchAttendance}
          />
        </div>

        {/* Left Bottom: Recent Leave Requests - spans 8 columns on desktop */}
        <div className="lg:col-span-8">
          <RecentLeaveRequests
            leaves={getDisplayLeaves()}
            loading={loadingLeaves}
            error={errorLeaves}
            onRetry={fetchLeaves}
            onViewLeave={(leave) => {
              setSelectedLeave(leave);
              setIsLeaveModalOpen(true);
            }}
          />
        </div>

        {/* Right Bottom: Upcoming Holidays List - spans 4 columns on desktop */}
        <div className="lg:col-span-4">
          <UpcomingHolidays
            holidays={holidays}
            loading={loadingHolidays}
            error={errorHolidays}
            onRetry={fetchHolidays}
          />
        </div>

        {/* Full span Bottom: Quick Navigation Actions Grid */}
        <div className="lg:col-span-12">
          <HRQuickActions />
        </div>
      </div>

      {/* Leave Details Modal Overlay */}
      <LeaveDetailsModal
        isOpen={isLeaveModalOpen}
        leave={selectedLeave}
        onClose={() => {
          setSelectedLeave(null);
          setIsLeaveModalOpen(false);
        }}
      />
    </div>
  );
}
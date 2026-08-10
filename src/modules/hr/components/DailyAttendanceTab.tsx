// src/modules/hr/components/DailyAttendanceTab.tsx

"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Users,
  UserCheck,
  UserX,
  CalendarCheck,
  Clock,
  Eye,
  LogIn,
  LogOut,
  Search,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import {
  AttendanceStaff,
  AttendanceResponse,
  AttendanceFilters,
  ActiveStaff,
} from "../types/attendance.types";
import {
  getAttendanceLog,
  checkInStaff,
  checkOutStaff,
  bulkCheckInStaff,
  bulkCheckOutStaff,
  getAttendanceStaffs,
} from "../services/attendance.service";
import { getHRRoles, Role } from "@/modules/admin/services/staff.service";
import AttendanceDetailsModal from "./AttendanceDetailsModal";

// Helper function to get Monday and Sunday of current week
function getThisWeekRange() {
  const now = new Date();
  const day = now.getDay(); // 0 is Sunday, 1 is Monday
  const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
  
  const monday = new Date(now.setDate(diffToMonday));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const formatDate = (d: Date) => d.toISOString().split("T")[0];
  return {
    from_date: formatDate(monday),
    to_date: formatDate(sunday),
  };
}

const formatAttendanceTime = (timeStr: string | null | undefined) => {
  if (!timeStr) return "—";
  try {
    if (!timeStr.includes("T")) return timeStr;
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return timeStr;
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (e) {
    return timeStr;
  }
};


export default function DailyAttendanceTab() {
  // Data States
  const [data, setData] = useState<AttendanceResponse>({
    total_present: 0,
    total_absent: 0,
    total_leave: 0,
    total_half_day: 0,
    staffs: [],
    pagination: { page: 1, page_size: 5, total_count: 0, total_pages: 1 },
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [period, setPeriod] = useState<
    "today" | "week" | "month" | "year" | "custom"
  >("today");
  const [customFromDate, setCustomFromDate] = useState("");
  const [customToDate, setCustomToDate] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [searchStaff, setSearchStaff] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  // Department Dropdown Items
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>(
    []
  );

  // Selection & Bulk Actions
  const [selectedStaffIds, setSelectedStaffIds] = useState<number[]>([]);
  const [activeStaffs, setActiveStaffs] = useState<ActiveStaff[]>([]);

  // Modals
  const [selectedStaffDetails, setSelectedStaffDetails] =
    useState<AttendanceStaff | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "single-check-in" | "single-check-out" | "bulk-check-in" | "bulk-check-out";
    staffId?: number;
    staffName?: string;
  }>({ isOpen: false, type: "single-check-in" });

  const [actionLoading, setActionLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchStaff.trim());
    }, 350);
    return () => clearTimeout(handler);
  }, [searchStaff]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [period, customFromDate, customToDate, selectedRoleId, selectedStatus, debouncedSearch]);

  // Load Departments & Staff list for mapping & dropdown
  useEffect(() => {
    async function loadRolesAndStaffs() {
      try {
        const [rolesData, staffsData] = await Promise.all([
          getHRRoles().catch(() => []),
          getAttendanceStaffs().catch(() => []),
        ]);

        setActiveStaffs(staffsData);

        // Build unique list of departments (with role_id)
        const deptMap = new Map<number, string>();
        if (Array.isArray(rolesData)) {
          rolesData.forEach((r: Role) => {
            deptMap.set(r.id, r.role_name);
          });
        }

        // Also incorporate any roles from staffsData if present
        staffsData.forEach((s) => {
          if (s.role_name && !Array.from(deptMap.values()).includes(s.role_name)) {
            // Find an id or use fallback
            const matchRole = rolesData.find(
              (r: Role) => r.role_name.toLowerCase() === s.role_name.toLowerCase()
            );
            if (matchRole) {
              deptMap.set(matchRole.id, matchRole.role_name);
            }
          }
        });

        const deptList = Array.from(deptMap.entries()).map(([id, name]) => ({
          id,
          name: name.charAt(0).toUpperCase() + name.slice(1),
        }));

        setDepartments(deptList);
      } catch (err) {
        console.error("Error loading departments/staffs:", err);
      }
    }
    loadRolesAndStaffs();
  }, []);

  // Fetch Attendance Log
  const fetchAttendance = async () => {
    setIsLoading(true);
    setError(null);

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const filters: AttendanceFilters = {
      page: currentPage,
      page_size: 5,
    };

    if (debouncedSearch) filters.staff_name = debouncedSearch;
    if (selectedRoleId) filters.role_id = selectedRoleId;
    if (selectedStatus) filters.status = selectedStatus;

    // Handle Period filters
    if (period === "today") {
      filters.date = todayStr;
    } else if (period === "week") {
      const weekRange = getThisWeekRange();
      filters.from_date = weekRange.from_date;
      filters.to_date = weekRange.to_date;
    } else if (period === "month") {
      filters.month = now.getMonth() + 1;
      filters.year = now.getFullYear();
    } else if (period === "year") {
      filters.year = now.getFullYear();
    } else if (period === "custom") {
      if (customFromDate) filters.from_date = customFromDate;
      if (customToDate) filters.to_date = customToDate;
    }

    try {
      const res = await getAttendanceLog(filters);
      setData(res);
    } catch (err: any) {
      console.error("Error fetching attendance log:", err);
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load attendance records."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [
    currentPage,
    period,
    customFromDate,
    customToDate,
    selectedRoleId,
    selectedStatus,
    debouncedSearch,
  ]);

  // Handle Reset Filters
  const handleResetFilters = () => {
    setPeriod("today");
    setCustomFromDate("");
    setCustomToDate("");
    setSelectedRoleId("");
    setSelectedStatus("");
    setSearchStaff("");
    setDebouncedSearch("");
    setCurrentPage(1);
  };

  // Determine if active filters exist
  const isFilterActive =
    period !== "today" ||
    selectedRoleId !== "" ||
    selectedStatus !== "" ||
    searchStaff !== "" ||
    customFromDate !== "" ||
    customToDate !== "";

  // Selection Logic
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = data.staffs.map((s) => s.staff_id);
      setSelectedStaffIds(allIds);
    } else {
      setSelectedStaffIds([]);
    }
  };

  const handleSelectRow = (staffId: number) => {
    setSelectedStaffIds((prev) =>
      prev.includes(staffId)
        ? prev.filter((id) => id !== staffId)
        : [...prev, staffId]
    );
  };

  // Individual Actions
  const handleIndividualAction = async () => {
    if (!confirmModal.staffId || !confirmModal.type) return;

    setActionLoading(true);
    const nowIso = new Date().toISOString();

    try {
      if (confirmModal.type === "single-check-in") {
        await checkInStaff(nowIso, confirmModal.staffId);
        setToastMsg({
          type: "success",
          text: `Check-in successful for ${confirmModal.staffName || "staff"}!`,
        });
      } else if (confirmModal.type === "single-check-out") {
        await checkOutStaff(nowIso, confirmModal.staffId);
        setToastMsg({
          type: "success",
          text: `Check-out successful for ${confirmModal.staffName || "staff"}!`,
        });
      }
      setConfirmModal({ isOpen: false, type: "single-check-in" });
      fetchAttendance();
    } catch (err: any) {
      console.error("Action error:", err);
      setToastMsg({
        type: "error",
        text:
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Action failed. Please try again.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk Actions
  const handleBulkAction = async () => {
    if (selectedStaffIds.length === 0) return;

    setActionLoading(true);
    const nowIso = new Date().toISOString();

    try {
      if (confirmModal.type === "bulk-check-in") {
        await bulkCheckInStaff(selectedStaffIds, nowIso);
        setToastMsg({
          type: "success",
          text: `Bulk check-in successful for ${selectedStaffIds.length} staff members!`,
        });
      } else if (confirmModal.type === "bulk-check-out") {
        await bulkCheckOutStaff(selectedStaffIds, nowIso);
        setToastMsg({
          type: "success",
          text: `Bulk check-out successful for ${selectedStaffIds.length} staff members!`,
        });
      }
      setSelectedStaffIds([]);
      setConfirmModal({ isOpen: false, type: "bulk-check-in" });
      fetchAttendance();
    } catch (err: any) {
      console.error("Bulk action error:", err);
      setToastMsg({
        type: "error",
        text:
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Bulk action failed.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Derived status badges styling
  const getStatusBadge = (staff: AttendanceStaff) => {
    const rawStatus = (staff.status || "").toLowerCase();
    const isWorking = staff.check_in && !staff.check_out;

    if (isWorking) {
      return (
        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
          <Clock size={12} className="animate-spin" /> Working
        </span>
      );
    }

    if (rawStatus.includes("present")) {
      return (
        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
          <CheckCircle2 size={12} /> Present
        </span>
      );
    }

    if (rawStatus.includes("absent")) {
      return (
        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
          Absent
        </span>
      );
    }

    if (rawStatus.includes("leave")) {
      return (
        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
          On Leave
        </span>
      );
    }

    if (rawStatus.includes("half")) {
      return (
        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
          Half Day
        </span>
      );
    }

    if (rawStatus.includes("holiday")) {
      return (
        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
          Holiday
        </span>
      );
    }

    return (
      <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
        {staff.status || "—"}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed top-5 right-5 z-[3000] px-4 py-3 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2 duration-200 ${
            toastMsg.type === "success"
              ? "bg-emerald-600 text-white border-emerald-700"
              : "bg-rose-600 text-white border-rose-700"
          }`}
        >
          {toastMsg.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          {toastMsg.text}
        </div>
      )}

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Present Card */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Present
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {data.total_present}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <UserCheck size={20} />
          </div>
        </div>

        {/* Absent Card */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Absent
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {data.total_absent}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
            <UserX size={20} />
          </div>
        </div>

        {/* On Leave Card */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              On Leave
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {data.total_leave}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
            <CalendarCheck size={20} />
          </div>
        </div>

        {/* Half Day Card */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Half Day
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {data.total_half_day}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
            <Clock size={20} />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Period Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600">Period:</label>
            <select
              value={period}
              onChange={(e) =>
                setPeriod(
                  e.target.value as "today" | "week" | "month" | "year" | "custom"
                )
              }
              className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50/50 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Range Inputs */}
          {period === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customFromDate}
                onChange={(e) => setCustomFromDate(e.target.value)}
                className="h-9 px-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-slate-400 text-xs font-bold">to</span>
              <input
                type="date"
                value={customToDate}
                onChange={(e) => setCustomToDate(e.target.value)}
                className="h-9 px-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Department Filter (shows department names, sends role_id) */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600">
              Department:
            </label>
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50/50 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600">Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50/50 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Leave">Leave</option>
              <option value="Half Day">Half Day</option>
              <option value="Holiday">Holiday</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search Staff */}
          <div className="relative flex-1 sm:w-56">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchStaff}
              onChange={(e) => setSearchStaff(e.target.value)}
              placeholder="Search staff..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Reset Filters */}
          {isFilterActive && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="h-9 px-3 text-xs font-bold rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="Reset all filters"
            >
              <RotateCcw size={14} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden relative">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4 w-[40px] text-center border-r border-slate-200">
                  <input
                    type="checkbox"
                    checked={
                      data.staffs.length > 0 &&
                      selectedStaffIds.length === data.staffs.length
                    }
                    onChange={handleSelectAll}
                    className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4 border-r border-slate-200 min-w-[160px]">
                  STAFF
                </th>
                <th className="py-3.5 px-4 border-r border-slate-200 min-w-[130px]">
                  DEPARTMENT
                </th>
                <th className="py-3.5 px-4 border-r border-slate-200 w-[110px] text-center">
                  CHECK IN
                </th>
                <th className="py-3.5 px-4 border-r border-slate-200 w-[110px] text-center">
                  CHECK OUT
                </th>
                <th className="py-3.5 px-4 border-r border-slate-200 w-[110px] text-center">
                  WORKING HOURS
                </th>
                <th className="py-3.5 px-4 border-r border-slate-200 w-[130px] text-center">
                  STATUS
                </th>
                <th className="py-3.5 px-4 border-r border-slate-200 min-w-[140px]">
                  REMARKS
                </th>
                <th className="py-3.5 px-4 w-[130px] text-center">ACTION</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center py-12 text-slate-500 font-semibold"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading attendance records...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center py-10 text-rose-600 font-semibold"
                  >
                    {error}
                  </td>
                </tr>
              ) : data.staffs.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center py-12 text-slate-400 font-semibold"
                  >
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                data.staffs.map((staff) => {
                  const isSelected = selectedStaffIds.includes(staff.staff_id);
                  const isWorking = staff.check_in && !staff.check_out;
                  const isCompleted = staff.check_in && staff.check_out;
                  const isAbsent = !staff.check_in;

                  return (
                    <tr
                      key={`${staff.staff_id}-${staff.attendance_date || ""}`}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? "bg-indigo-50/30" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4 text-center border-r border-slate-200 align-middle">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(staff.staff_id)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      {/* Staff Name */}
                      <td className="py-3.5 px-4 border-r border-slate-200 font-bold text-slate-900 align-middle">
                        <div className="flex flex-col">
                          <span>{staff.staff_name || "—"}</span>
                          {period !== "today" && staff.attendance_date && (
                            <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                              {staff.attendance_date}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4 border-r border-slate-200 font-medium text-slate-600 align-middle">
                        {staff.department_name || staff.role_name || "—"}
                      </td>

                      {/* Check In */}
                      <td className="py-3.5 px-4 border-r border-slate-200 text-center font-semibold text-slate-800 align-middle whitespace-nowrap">
                        {formatAttendanceTime(staff.check_in)}
                      </td>

                      {/* Check Out */}
                      <td className="py-3.5 px-4 border-r border-slate-200 text-center font-semibold text-slate-800 align-middle whitespace-nowrap">
                        {formatAttendanceTime(staff.check_out)}
                      </td>

                      {/* Working Hours */}
                      <td className="py-3.5 px-4 border-r border-slate-200 text-center font-semibold text-slate-700 align-middle whitespace-nowrap">
                        {staff.worked_hours ||
                          (staff.working_minutes
                            ? `${Math.floor(staff.working_minutes / 60)}h ${
                                staff.working_minutes % 60
                              }m`
                            : "—")}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 border-r border-slate-200 text-center align-middle whitespace-nowrap">
                        {getStatusBadge(staff)}
                      </td>

                      {/* Remarks */}
                      <td className="py-3.5 px-4 border-r border-slate-200 text-slate-600 align-middle truncate max-w-[180px]">
                        {staff.remarks || "—"}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center align-middle whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Requirement 3: Contextual Check In / Check Out buttons */}
                          {isAbsent && (
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmModal({
                                  isOpen: true,
                                  type: "single-check-in",
                                  staffId: staff.staff_id,
                                  staffName: staff.staff_name,
                                })
                              }
                              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                              title="Check In Staff"
                            >
                              <LogIn size={13} /> Check In
                            </button>
                          )}

                          {isWorking && (
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmModal({
                                  isOpen: true,
                                  type: "single-check-out",
                                  staffId: staff.staff_id,
                                  staffName: staff.staff_name,
                                })
                              }
                              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                              title="Check Out Staff"
                            >
                              <LogOut size={13} /> Check Out
                            </button>
                          )}

                          {isCompleted && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-500 border border-slate-200">
                              Completed
                            </span>
                          )}

                          {/* View Details Eye Icon Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStaffDetails(staff);
                              setIsDetailsOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-200"
                            title="View Details"
                          >
                            <Eye size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Server Pagination */}
        {!isLoading && data.staffs.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50">
            <div className="text-xs text-slate-500 font-semibold">
              Showing page <strong>{data.pagination.page}</strong> of{" "}
              <strong>{data.pagination.total_pages}</strong> (
              {data.pagination.total_count} records)
            </div>
            <Pagination
              total={data.pagination.total_count}
              limit={data.pagination.page_size}
              activePage={currentPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* Sticky Bulk Action Bar */}
      {selectedStaffIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5 duration-200 border border-slate-800">
          <span className="text-xs font-bold text-slate-200">
            <strong>{selectedStaffIds.length}</strong> staff selected
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setConfirmModal({
                  isOpen: true,
                  type: "bulk-check-in",
                })
              }
              className="px-3.5 py-1.5 text-xs font-extrabold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <LogIn size={14} /> Bulk Check In
            </button>

            <button
              type="button"
              onClick={() =>
                setConfirmModal({
                  isOpen: true,
                  type: "bulk-check-out",
                })
              }
              className="px-3.5 py-1.5 text-xs font-extrabold rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <LogOut size={14} /> Bulk Check Out
            </button>

            <button
              type="button"
              onClick={() => setSelectedStaffIds([])}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer ml-1"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      <AttendanceDetailsModal
        isOpen={isDetailsOpen}
        staff={selectedStaffDetails}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedStaffDetails(null);
        }}
      />

      {/* Confirmation Modal for Individual / Bulk Check-in / Check-out */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[2500] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200 p-5 flex flex-col gap-4 text-center">
            <div className="h-12 w-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              {confirmModal.type.includes("check-in") ? (
                <LogIn size={24} />
              ) : (
                <LogOut size={24} />
              )}
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Confirm{" "}
                {confirmModal.type.includes("check-in")
                  ? "Check-In"
                  : "Check-Out"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {confirmModal.type.startsWith("bulk")
                  ? `Are you sure you want to perform bulk ${
                      confirmModal.type.includes("check-in")
                        ? "check-in"
                        : "check-out"
                    } for ${selectedStaffIds.length} staff members?`
                  : `Are you sure you want to mark ${
                      confirmModal.type.includes("check-in")
                        ? "check-in"
                        : "check-out"
                    } for ${confirmModal.staffName || "this staff member"}?`}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  setConfirmModal({ isOpen: false, type: "single-check-in" })
                }
                className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmModal.type.startsWith("bulk")) {
                    handleBulkAction();
                  } else {
                    handleIndividualAction();
                  }
                }}
                disabled={actionLoading}
                className={`px-4 py-2 text-xs font-bold rounded-lg text-white transition-colors cursor-pointer disabled:opacity-50 ${
                  confirmModal.type.includes("check-in")
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {actionLoading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

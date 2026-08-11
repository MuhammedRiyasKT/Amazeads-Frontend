// src/modules/profile/components/PersonalAttendanceHistory.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Clock, CheckCircle2, RotateCcw } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import {
  SharedAttendanceFilters,
  SharedAttendanceData,
  SharedAttendanceStaff,
  SharedAttendanceItem,
} from "../types/personalAttendance.types";
import { getSharedAttendanceLog } from "../services/personalAttendance.service";

interface FlatHistoryRecord {
  date: string;
  check_in: string | null;
  check_out: string | null;
  worked_hours: string | number | null;
  status: string;
  holiday_name?: string | null;
}

// Calculate start (Monday) and end (Sunday) of current week
function getThisWeekRange() {
  const now = new Date();
  const day = now.getDay();
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

const formatDateFriendly = (dateStr: string | null | undefined) => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day < 10 ? '0' + day : day} ${month} ${year}`;
  } catch (e) {
    return dateStr;
  }
};

interface PersonalAttendanceHistoryProps {
  currentUserId?: number;
  currentStaffName?: string;
  refreshTrigger: number;
}

export default function PersonalAttendanceHistory({
  currentUserId,
  currentStaffName,
  refreshTrigger,
}: PersonalAttendanceHistoryProps) {
  const [data, setData] = useState<SharedAttendanceData>({
    items: [],
    pagination: { page: 1, page_size: 5, total_count: 0, total_pages: 1 },
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [period, setPeriod] = useState<"today" | "week" | "month" | "year" | "custom">("month");
  const [customFromDate, setCustomFromDate] = useState("");
  const [customToDate, setCustomToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page to 1 when period or dates change
  useEffect(() => {
    setCurrentPage(1);
  }, [period, customFromDate, customToDate]);

  // Fetch History
  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const filters: SharedAttendanceFilters = {
      page: currentPage,
      page_size: 5,
    };

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
      const res = await getSharedAttendanceLog(filters);
      setData(res);
    } catch (err: any) {
      console.error("Error fetching personal attendance history:", err);
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load attendance history."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [currentPage, period, customFromDate, customToDate, refreshTrigger]);

  // Process items into flat records for the logged-in user
  const flatRecords: FlatHistoryRecord[] = [];
  (data.items || []).forEach((item: SharedAttendanceItem) => {
    const itemDate = item.attendance_date || item.date || "—";
    const staffs = item.staffs || [];

    if (staffs.length > 0) {
      // Find staff record for current logged-in user
      let matchedStaff: SharedAttendanceStaff | undefined;
      if (currentUserId) {
        matchedStaff = staffs.find((s) => s.staff_id === currentUserId);
      }
      if (!matchedStaff && currentStaffName) {
        matchedStaff = staffs.find(
          (s) =>
            s.staff_name &&
            s.staff_name.toLowerCase().trim() ===
              currentStaffName.toLowerCase().trim()
        );
      }

      // If no specific match found, take first staff object
      const targetStaff = matchedStaff || staffs[0];
      flatRecords.push({
        date: itemDate,
        check_in: targetStaff.check_in || null,
        check_out: targetStaff.check_out || null,
        worked_hours: targetStaff.worked_hours || targetStaff.working_minutes || null,
        status: item.holiday_status ? "Holiday" : targetStaff.status || "—",
        holiday_name: item.holiday_name,
      });
    } else {
      // Direct item representation
      flatRecords.push({
        date: itemDate,
        check_in: item.check_in || null,
        check_out: item.check_out || null,
        worked_hours: item.worked_hours || item.working_minutes || null,
        status: item.holiday_status ? "Holiday" : item.status || "—",
        holiday_name: item.holiday_name,
      });
    }
  });

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s.includes("present"))
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s.includes("absent"))
      return "bg-rose-50 text-rose-700 border-rose-200";
    if (s.includes("leave"))
      return "bg-amber-50 text-amber-700 border-amber-200";
    if (s.includes("half"))
      return "bg-purple-50 text-purple-700 border-purple-200";
    if (s.includes("holiday"))
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col gap-4 p-5 w-full">
      {/* Header & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <h3 className="font-extrabold text-slate-900 text-base">
          Attendance History
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <select
              value={period}
              onChange={(e) =>
                setPeriod(
                  e.target.value as "today" | "week" | "month" | "year" | "custom"
                )
              }
              className="h-9 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50/60 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {period === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customFromDate}
                onChange={(e) => setCustomFromDate(e.target.value)}
                className="h-9 px-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-slate-400 text-xs font-bold">to</span>
              <input
                type="date"
                value={customToDate}
                onChange={(e) => setCustomToDate(e.target.value)}
                className="h-9 px-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* 💻 DESKTOP ATTENDANCE TABLE (>= 768px / md:block) */}
      <div className="hidden md:block overflow-x-auto w-full border border-slate-200 rounded-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4 border-r border-slate-200">DATE</th>
              <th className="py-3 px-4 border-r border-slate-200 text-center">CHECK IN</th>
              <th className="py-3 px-4 border-r border-slate-200 text-center">CHECK OUT</th>
              <th className="py-3 px-4 border-r border-slate-200 text-center">WORKED HOURS</th>
              <th className="py-3 px-4 text-center">STATUS</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-slate-500 font-semibold">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading history...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-rose-600 font-semibold">
                  {error}
                </td>
              </tr>
            ) : flatRecords.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-slate-400 font-semibold">
                  No attendance history found.
                </td>
              </tr>
            ) : (
              flatRecords.map((row, idx) => (
                <tr key={`${row.date}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 border-r border-slate-200 font-bold text-slate-900 whitespace-nowrap">
                    {formatDateFriendly(row.date)}
                  </td>
                  <td className="py-3.5 px-4 border-r border-slate-200 text-center font-semibold text-slate-800 whitespace-nowrap">
                    {formatAttendanceTime(row.check_in)}
                  </td>
                  <td className="py-3.5 px-4 border-r border-slate-200 text-center font-semibold text-slate-800 whitespace-nowrap">
                    {formatAttendanceTime(row.check_out)}
                  </td>
                  <td className="py-3.5 px-4 border-r border-slate-200 text-center font-semibold text-slate-700 whitespace-nowrap">
                    {row.worked_hours ? `${row.worked_hours}h` : "—"}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${getStatusBadge(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 📱 MOBILE ATTENDANCE CARDS (< 768px / md:hidden) */}
      <div className="block md:hidden space-y-3 w-full">
        {isLoading ? (
          <div className="text-center py-10 text-slate-500 font-semibold bg-slate-50/50 rounded-xl border border-slate-200">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs">Loading history...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-xs font-semibold text-rose-600 bg-rose-50/50 rounded-xl border border-rose-200 p-4">
            {error}
          </div>
        ) : flatRecords.length === 0 ? (
          <div className="text-center py-10 text-xs font-semibold text-slate-400 bg-slate-50/50 rounded-xl border border-slate-200 p-4">
            No attendance history found.
          </div>
        ) : (
          flatRecords.map((row, idx) => (
            <div
              key={`mob-${row.date}-${idx}`}
              className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2.5 w-full min-w-0"
            >
              {/* Top Row: Date on Left, Status Badge on Right */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <span className="font-extrabold text-xs text-slate-900 truncate">
                  {formatDateFriendly(row.date)}
                </span>
                <span
                  className={`px-2.5 py-0.5 text-[11px] font-bold rounded-lg border whitespace-nowrap shrink-0 ${getStatusBadge(
                    row.status
                  )}`}
                >
                  {row.status}
                </span>
              </div>

              {/* Bottom Section: Check In, Check Out, Worked Hours */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-center text-xs">
                <div className="min-w-0">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block truncate">
                    Check In
                  </span>
                  <span className="font-extrabold text-slate-800 text-[11px] sm:text-xs block truncate mt-0.5">
                    {formatAttendanceTime(row.check_in)}
                  </span>
                </div>

                <div className="min-w-0 border-x border-slate-200/80 px-1">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block truncate">
                    Check Out
                  </span>
                  <span className="font-extrabold text-slate-800 text-[11px] sm:text-xs block truncate mt-0.5">
                    {formatAttendanceTime(row.check_out)}
                  </span>
                </div>

                <div className="min-w-0">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block truncate">
                    Worked Hours
                  </span>
                  <span className="font-extrabold text-indigo-600 text-[11px] sm:text-xs block truncate mt-0.5">
                    {row.worked_hours ? `${row.worked_hours}h` : "—"}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Footer */}
      {!isLoading && flatRecords.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-1 text-xs">
          <div className="text-slate-500 font-semibold text-center sm:text-left">
            Page <strong>{data.pagination.page}</strong> of <strong>{data.pagination.total_pages}</strong> ({data.pagination.total_count} records)
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
  );
}
// src/modules/profile/components/PersonalAttendanceHistory.tsx

"use client";

import React, { useState, useEffect } from "react";
import { CalendarDays, AlertCircle } from "lucide-react";
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

interface MonthlySummaryItem {
  monthLabel: string;
  monthIndex: number;
  year: number;
  present: number;
  absent: number;
  leave: number;
  holiday: number;
  totalWorkingDays: number;
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

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function PersonalAttendanceHistory({
  currentUserId,
  currentStaffName,
  refreshTrigger,
}: PersonalAttendanceHistoryProps) {
  const [data, setData] = useState<SharedAttendanceData>({
    items: [],
    pagination: { page: 1, page_size: 5, total_count: 0, total_pages: 1 },
  });

  const [allFetchedItems, setAllFetchedItems] = useState<SharedAttendanceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [period, setPeriod] = useState<"today" | "week" | "month" | "year" | "custom">("today");
  const [customFromDate, setCustomFromDate] = useState("");
  const [customToDate, setCustomToDate] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [summaryCurrentPage, setSummaryCurrentPage] = useState(1);

  // Check if current view is monthly summary mode
  const isMonthlySummaryView =
    period === "year" ||
    (period === "custom" &&
      customFromDate &&
      customToDate &&
      (() => {
        const start = new Date(customFromDate);
        const end = new Date(customToDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 31;
      })());

  const handlePeriodChange = (newPeriod: typeof period) => {
    setPeriod(newPeriod);
    setCurrentPage(1);
    setSummaryCurrentPage(1);
    setError(null);
  };

  // Fetch History
  const fetchHistory = async () => {
    // If Custom Range is selected but inputs are not complete or invalid, skip and clear state
    if (period === "custom") {
      if (!customFromDate || !customToDate) {
        setData({ items: [], pagination: { page: 1, page_size: 5, total_count: 0, total_pages: 1 } });
        setAllFetchedItems([]);
        setIsLoading(false);
        setError(null);
        return;
      }
      if (new Date(customFromDate) > new Date(customToDate)) {
        setData({ items: [], pagination: { page: 1, page_size: 5, total_count: 0, total_pages: 1 } });
        setAllFetchedItems([]);
        setIsLoading(false);
        setError("From Date cannot be after To Date.");
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const filters: SharedAttendanceFilters = {};

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
      filters.from_date = customFromDate;
      filters.to_date = customToDate;
    }

    try {
      if (isMonthlySummaryView) {
        // Summary mode: fetch all records in a loop (using page size 100)
        let allItems: SharedAttendanceItem[] = [];
        let page = 1;
        let totalPages = 1;
        const pageSize = 100;

        do {
          const res = await getSharedAttendanceLog({
            ...filters,
            page,
            page_size: pageSize,
          });
          if (res.items && res.items.length > 0) {
            allItems = [...allItems, ...res.items];
          }
          totalPages = res.pagination?.total_pages || 1;
          page++;
        } while (page <= totalPages);

        setAllFetchedItems(allItems);
      } else {
        // Daily view: fetch only current page (size 5)
        const res = await getSharedAttendanceLog({
          ...filters,
          page: currentPage,
          page_size: 5,
        });
        setData(res);
      }
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
  }, [currentPage, period, customFromDate, customToDate, refreshTrigger, isMonthlySummaryView]);

  // Helper to extract a daily record for the current user
  const getRecordForCurrentUser = (item: SharedAttendanceItem) => {
    const staffs = item.staffs || [];
    let matchedStaff: SharedAttendanceStaff | undefined;
    
    if (staffs.length > 0) {
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
      return matchedStaff || staffs[0];
    }
    
    return item as SharedAttendanceStaff;
  };

  // 1. Process items into flat records for Daily View
  const flatRecords: FlatHistoryRecord[] = [];
  if (!isMonthlySummaryView) {
    (data.items || []).forEach((item: SharedAttendanceItem) => {
      const itemDate = item.attendance_date || item.date || "—";
      const target = getRecordForCurrentUser(item);
      flatRecords.push({
        date: itemDate,
        check_in: target.check_in || null,
        check_out: target.check_out || null,
        worked_hours: target.worked_hours || target.working_minutes || null,
        status: item.holiday_status ? "Holiday" : target.status || "—",
        holiday_name: item.holiday_name,
      });
    });
  }

  // 2. Process and aggregate records for Monthly Summary View
  const allFlattenedRecords: FlatHistoryRecord[] = [];
  if (isMonthlySummaryView) {
    allFetchedItems.forEach((item: SharedAttendanceItem) => {
      const itemDate = item.attendance_date || item.date;
      if (!itemDate) return;
      const target = getRecordForCurrentUser(item);
      allFlattenedRecords.push({
        date: itemDate,
        check_in: target.check_in || null,
        check_out: target.check_out || null,
        worked_hours: target.worked_hours || target.working_minutes || null,
        status: item.holiday_status ? "Holiday" : target.status || "—",
        holiday_name: item.holiday_name,
      });
    });
  }

  const getMonthlySummaries = (): MonthlySummaryItem[] => {
    let monthsToBuild: { monthIndex: number; year: number; label: string }[] = [];
    
    if (period === "year") {
      const currentYear = new Date().getFullYear();
      monthsToBuild = monthNames.map((name, idx) => ({
        monthIndex: idx,
        year: currentYear,
        label: name,
      }));
    } else if (period === "custom" && customFromDate && customToDate) {
      const start = new Date(customFromDate);
      const end = new Date(customToDate);
      
      let current = new Date(start.getFullYear(), start.getMonth(), 1);
      const endBound = new Date(end.getFullYear(), end.getMonth(), 1);
      
      while (current <= endBound) {
        const mIdx = current.getMonth();
        const yr = current.getFullYear();
        monthsToBuild.push({
          monthIndex: mIdx,
          year: yr,
          label: `${monthNames[mIdx]} ${yr}`,
        });
        current.setMonth(current.getMonth() + 1);
      }
    }
    
    return monthsToBuild.map((m) => {
      let presentCount = 0;
      let absentCount = 0;
      let leaveCount = 0;
      let holidayCount = 0;
      
      allFlattenedRecords.forEach((rec) => {
        const recDate = new Date(rec.date);
        if (isNaN(recDate.getTime())) return;
        
        if (recDate.getMonth() === m.monthIndex && recDate.getFullYear() === m.year) {
          const statusLower = (rec.status || "").toLowerCase().trim();
          
          if (statusLower === "holiday" || statusLower.includes("holiday")) {
            holidayCount++;
          } else if (statusLower.includes("present") || statusLower.includes("half")) {
            presentCount++;
          } else if (statusLower.includes("leave")) {
            leaveCount++;
          } else if (statusLower.includes("absent")) {
            absentCount++;
          }
        }
      });
      
      const totalWorkingDays = presentCount + absentCount + leaveCount;
      
      return {
        monthLabel: m.label,
        monthIndex: m.monthIndex,
        year: m.year,
        present: presentCount,
        absent: absentCount,
        leave: leaveCount,
        holiday: holidayCount,
        totalWorkingDays,
      };
    });
  };

  const summaryList = isMonthlySummaryView ? getMonthlySummaries() : [];
  
  // Calculate aggregate totals for the summary cards
  const summaryTotals = summaryList.reduce(
    (acc, curr) => {
      acc.present += curr.present;
      acc.absent += curr.absent;
      acc.leave += curr.leave;
      acc.holiday += curr.holiday;
      return acc;
    },
    { present: 0, absent: 0, leave: 0, holiday: 0 }
  );

  const summaryPageLimit = 12;
  const totalSummaryPages = Math.ceil(summaryList.length / summaryPageLimit);
  const paginatedSummaryList = summaryList.slice(
    (summaryCurrentPage - 1) * summaryPageLimit,
    summaryCurrentPage * summaryPageLimit
  );

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

  const getEmptyStateMessage = () => {
    switch (period) {
      case "today":
        return "No attendance record for today.";
      case "week":
        return "No attendance records found for this week.";
      case "month":
        return "No attendance records found for this month.";
      case "year":
        return "No attendance records found for this year.";
      case "custom":
        return "No attendance records found for the selected date range.";
      default:
        return "No attendance records found.";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col gap-4 p-5 w-full animate-fadeIn">
      {/* Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base">
            Attendance History
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Segmented switcher (Pill-box style) */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl select-none border border-slate-200/50 shadow-xs">
            {(["today", "week", "month", "year", "custom"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handlePeriodChange(t)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer select-none ${
                  period === t
                    ? "bg-white text-slate-800 shadow-xs"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                }`}
              >
                {t === "today" && "Today"}
                {t === "week" && "This Week"}
                {t === "month" && "This Month"}
                {t === "year" && "This Year"}
                {t === "custom" && "Custom"}
              </button>
            ))}
          </div>

          {/* Date inputs (only if period === 'custom') */}
          {period === "custom" && (
            <div className="flex items-center gap-2 animate-fadeIn">
              <input
                type="date"
                value={customFromDate}
                onChange={(e) => setCustomFromDate(e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 cursor-pointer"
              />
              <span className="text-slate-400 text-xs font-bold">to</span>
              <input
                type="date"
                value={customToDate}
                onChange={(e) => setCustomToDate(e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

      {/* Header Visual Distinction */}
      <div className="flex items-center mt-1">
        <h4 className="font-bold text-slate-500 text-[10px] tracking-wider uppercase">
          {isMonthlySummaryView ? "Monthly Attendance Summary" : "Daily Attendance"}
        </h4>
      </div>

      {/* Monthly Summary Statistics Grid */}
      {isMonthlySummaryView && !isLoading && !error && summaryList.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fadeIn">
          <div className="bg-emerald-50/40 border border-emerald-100/50 p-3.5 rounded-xl">
            <span className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-wider block">Present</span>
            <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">{summaryTotals.present}</span>
          </div>
          <div className="bg-rose-50/40 border border-rose-100/50 p-3.5 rounded-xl">
            <span className="text-[10px] font-bold text-rose-600/70 uppercase tracking-wider block">Absent</span>
            <span className="text-2xl font-extrabold text-rose-600 mt-1 block">{summaryTotals.absent}</span>
          </div>
          <div className="bg-amber-50/40 border border-amber-100/50 p-3.5 rounded-xl">
            <span className="text-[10px] font-bold text-amber-600/70 uppercase tracking-wider block">Leave</span>
            <span className="text-2xl font-extrabold text-amber-600 mt-1 block">{summaryTotals.leave}</span>
          </div>
          <div className="bg-indigo-50/40 border border-indigo-100/50 p-3.5 rounded-xl">
            <span className="text-[10px] font-bold text-indigo-600/70 uppercase tracking-wider block">Holidays</span>
            <span className="text-2xl font-extrabold text-indigo-600 mt-1 block">{summaryTotals.holiday}</span>
          </div>
        </div>
      )}

      {/* Dynamic Tables / Lists / Cards */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-500 font-semibold bg-slate-50/50 rounded-xl border border-slate-200/60">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading attendance...</span>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-10 font-semibold text-rose-600 bg-rose-50/50 rounded-xl border border-rose-200 p-4">
          {error}
        </div>
      ) : period === "custom" && (!customFromDate || !customToDate) ? (
        <div className="text-center py-12 text-slate-400 font-semibold bg-slate-50/50 rounded-xl border border-slate-200/60">
          Please select both From and To dates to view attendance history.
        </div>
      ) : (!isMonthlySummaryView && flatRecords.length === 0) || (isMonthlySummaryView && summaryList.length === 0) ? (
        <div className="text-center py-12 text-slate-400 font-semibold bg-slate-50/50 rounded-xl border border-slate-200/60">
          {getEmptyStateMessage()}
        </div>
      ) : (
        <>
          {/* DAILY ATTENDANCE - DESKTOP VIEW */}
          {!isMonthlySummaryView && (
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
                  {flatRecords.map((row, idx) => (
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
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* DAILY ATTENDANCE - MOBILE VIEW */}
          {!isMonthlySummaryView && (
            <div className="block md:hidden space-y-3 w-full">
              {flatRecords.map((row, idx) => (
                <div
                  key={`mob-day-${row.date}-${idx}`}
                  className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2.5 w-full min-w-0"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <span className="font-extrabold text-xs text-slate-900 truncate">
                      {formatDateFriendly(row.date)}
                    </span>
                    <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-lg border whitespace-nowrap shrink-0 ${getStatusBadge(row.status)}`}>
                      {row.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-center text-xs">
                    <div className="min-w-0">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block truncate">Check In</span>
                      <span className="font-extrabold text-slate-800 text-[11px] sm:text-xs block truncate mt-0.5">
                        {formatAttendanceTime(row.check_in)}
                      </span>
                    </div>
                    <div className="min-w-0 border-x border-slate-200/80 px-1">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block truncate">Check Out</span>
                      <span className="font-extrabold text-slate-800 text-[11px] sm:text-xs block truncate mt-0.5">
                        {formatAttendanceTime(row.check_out)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block truncate">Worked Hours</span>
                      <span className="font-extrabold text-indigo-600 text-[11px] sm:text-xs block truncate mt-0.5">
                        {row.worked_hours ? `${row.worked_hours}h` : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MONTHLY SUMMARY - DESKTOP VIEW */}
          {isMonthlySummaryView && (
            <div className="hidden md:block overflow-x-auto w-full border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4 border-r border-slate-200">MONTH</th>
                    <th className="py-3 px-4 border-r border-slate-200 text-center">PRESENT</th>
                    <th className="py-3 px-4 border-r border-slate-200 text-center">ABSENT</th>
                    <th className="py-3 px-4 border-r border-slate-200 text-center">LEAVE</th>
                    <th className="py-3 px-4 border-r border-slate-200 text-center">HOLIDAY</th>
                    <th className="py-3 px-4 text-center">TOTAL WORKING DAYS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedSummaryList.map((row, idx) => (
                    <tr key={`${row.monthLabel}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 border-r border-slate-200 font-bold text-slate-900 whitespace-nowrap">
                        {row.monthLabel}
                      </td>
                      <td className="py-3.5 px-4 border-r border-slate-200 text-center font-bold text-emerald-600 whitespace-nowrap">
                        {row.present}
                      </td>
                      <td className="py-3.5 px-4 border-r border-slate-200 text-center font-bold text-rose-600 whitespace-nowrap">
                        {row.absent}
                      </td>
                      <td className="py-3.5 px-4 border-r border-slate-200 text-center font-bold text-amber-600 whitespace-nowrap">
                        {row.leave}
                      </td>
                      <td className="py-3.5 px-4 border-r border-slate-200 text-center font-bold text-indigo-600 whitespace-nowrap">
                        {row.holiday}
                      </td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-slate-700 whitespace-nowrap bg-slate-50/30">
                        {row.totalWorkingDays}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* MONTHLY SUMMARY - MOBILE VIEW */}
          {isMonthlySummaryView && (
            <div className="block md:hidden space-y-3 w-full">
              {paginatedSummaryList.map((row, idx) => (
                <div
                  key={`mob-sum-${row.monthLabel}-${idx}`}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 w-full min-w-0"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-extrabold text-sm text-slate-900">
                      {row.monthLabel}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Summary
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100/50 flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Present</span>
                      <span className="font-extrabold text-emerald-600">{row.present}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100/50 flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Absent</span>
                      <span className="font-extrabold text-rose-600">{row.absent}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100/50 flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Leave</span>
                      <span className="font-extrabold text-amber-600">{row.leave}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100/50 flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Holiday</span>
                      <span className="font-extrabold text-indigo-600">{row.holiday}</span>
                    </div>
                  </div>
                  <div className="bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100/30 flex justify-between items-center text-xs">
                    <span className="text-indigo-950 font-bold">Total Working Days</span>
                    <span className="font-extrabold text-indigo-700">{row.totalWorkingDays}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-1 text-xs animate-fadeIn">
            <div className="text-slate-500 font-semibold text-center sm:text-left">
              {isMonthlySummaryView ? (
                <span>
                  Showing <strong>{paginatedSummaryList.length}</strong> of <strong>{summaryList.length}</strong> months
                </span>
              ) : (
                <span>
                  Page <strong>{data.pagination.page}</strong> of <strong>{data.pagination.total_pages}</strong> ({data.pagination.total_count} records)
                </span>
              )}
            </div>
            {isMonthlySummaryView ? (
              <Pagination
                total={summaryList.length}
                limit={summaryPageLimit}
                activePage={summaryCurrentPage}
                onPageChange={(page) => setSummaryCurrentPage(page)}
              />
            ) : (
              <Pagination
                total={data.pagination.total_count}
                limit={data.pagination.page_size}
                activePage={currentPage}
                onPageChange={(page) => setCurrentPage(page)}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
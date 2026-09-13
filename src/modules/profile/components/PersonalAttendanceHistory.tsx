// src/modules/profile/components/PersonalAttendanceHistory.tsx

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  CalendarDays,
  AlertCircle,
  RotateCcw,
  Calendar,
  X,
  Filter,
  UserCheck,
  UserX,
  Clock,
  Palmtree,
  Briefcase,
  FileText,
  Eye,
  ArrowRight,
} from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import {
  PersonalReportPeriod,
  PersonalAttendanceFilters,
  PersonalAttendanceReportItem,
  PersonalAttendancePagination,
} from "../types/personalAttendance.types";
import { getPersonalAttendanceReport } from "../services/personalAttendance.service";
import PersonalAttendanceDetailsModal from "./PersonalAttendanceDetailsModal";

interface PersonalAttendanceHistoryProps {
  currentUserId?: number;
  currentStaffName?: string;
  refreshTrigger?: number;
}

export default function PersonalAttendanceHistory({
  currentUserId,
  currentStaffName,
  refreshTrigger = 0,
}: PersonalAttendanceHistoryProps) {
  // 1. Period Switcher State
  const [period, setPeriod] = useState<PersonalReportPeriod>("day");

  // 2. Filters State
  const [filters, setFilters] = useState<PersonalAttendanceFilters>({
    page: 1,
    page_size: 5,
  });

  // 3. Data & Pagination State
  const [items, setItems] = useState<PersonalAttendanceReportItem[]>([]);
  const [pagination, setPagination] = useState<PersonalAttendancePagination>({
    page: 1,
    page_size: 5,
    total_count: 0,
    total_pages: 1,
  });

  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedDetailDate, setSelectedDetailDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  // ── Fetch Report Data ──────────────────────────────────────────────────────
  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const queryFilters: PersonalAttendanceFilters = {
      ...filters,
      staff_id: currentUserId || filters.staff_id,
    };

    try {
      const res = await getPersonalAttendanceReport(period, queryFilters);
      const fetchedItems = res.data?.items || [];
      const fetchedPagination = res.data?.pagination || {
        page: filters.page || 1,
        page_size: filters.page_size || 5,
        total_count: fetchedItems.length,
        total_pages: Math.ceil(fetchedItems.length / (filters.page_size || 5)) || 1,
      };

      setItems(fetchedItems);
      setPagination(fetchedPagination);

      if (fetchedItems.length > 0) {
        setSelectedItemId(fetchedItems[0].id);
      } else {
        setSelectedItemId(null);
      }
    } catch (err: any) {
      console.error(`Error fetching personal attendance report for ${period}:`, err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.detail ||
          "Unable to load attendance report."
      );
    } finally {
      setIsLoading(false);
    }
  }, [period, filters, currentUserId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport, refreshTrigger]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handlePeriodChange = (newPeriod: PersonalReportPeriod) => {
    if (newPeriod === period) return;
    setPeriod(newPeriod);
    setFilters({
      page: 1,
      page_size: filters.page_size || 5,
    });
  };

  const handleFilterChange = (updated: Partial<PersonalAttendanceFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...updated,
      page: 1, // Reset page to 1 on filter change
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      page_size: filters.page_size || 5,
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  // Smart Action button handler
  const handleRowAction = (row: PersonalAttendanceReportItem) => {
    if (period === "day") {
      // Single day modal details
      setSelectedDetailDate(row.date || row.from_date || null);
    } else if (period === "month") {
      // Drill down to Day view for this month
      const targetDateStr = row.from_date || row.date;
      if (targetDateStr) {
        const d = new Date(targetDateStr);
        if (!isNaN(d.getTime())) {
          setPeriod("day");
          setFilters({
            page: 1,
            page_size: 5,
            month: d.getMonth() + 1,
            year: d.getFullYear(),
          });
        }
      }
    } else if (period === "week") {
      // Drill down to Day view for this week
      if (row.from_date && row.to_date) {
        setPeriod("day");
        setFilters({
          page: 1,
          page_size: 5,
          from_date: row.from_date,
          to_date: row.to_date,
        });
      }
    } else if (period === "year") {
      // Drill down to Month view for this year
      const targetDateStr = row.from_date || row.date;
      if (targetDateStr) {
        const d = new Date(targetDateStr);
        if (!isNaN(d.getTime())) {
          setPeriod("month");
          setFilters({
            page: 1,
            page_size: 5,
            year: d.getFullYear(),
          });
        }
      }
    }
  };

  // Determine active item for Summary Cards
  const activeSummaryItem = useMemo(() => {
    if (!items || items.length === 0) return null;
    if (selectedItemId !== null) {
      const found = items.find((i) => i.id === selectedItemId);
      if (found) return found;
    }
    return items[0] || null;
  }, [items, selectedItemId]);

  const hasActiveFilters = Boolean(
    filters.date ||
      filters.from_date ||
      filters.to_date ||
      filters.month ||
      filters.year ||
      filters.upto_today
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col gap-5 p-5 w-full animate-fadeIn">
      {/* 1. Header & Period Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <CalendarDays size={18} className="text-indigo-600" />
            Attendance History
          </h3>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            View your attendance report by period
          </p>
        </div>

        {/* Period Switcher Segmented Control */}
        <div className="inline-flex p-1 bg-slate-100 border border-slate-200/60 rounded-xl select-none">
          {(["day", "week", "month", "year"] as const).map((p) => {
            const isActive = period === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => handlePeriodChange(p)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer capitalize ${
                  isActive
                    ? "bg-white text-indigo-600 shadow-xs border border-slate-200/80"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Filters Section */}
      <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-600 font-extrabold text-xs">
            <Filter size={14} className="text-slate-400" />
            <span>Filters ({period.toUpperCase()})</span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
            >
              <X size={12} />
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* DAY Filters */}
          {period === "day" && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Date</label>
                <input
                  type="date"
                  value={filters.date || ""}
                  onChange={(e) => handleFilterChange({ date: e.target.value || undefined })}
                  className="h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 font-semibold cursor-pointer text-slate-700"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">From Date</label>
                <input
                  type="date"
                  value={filters.from_date || ""}
                  onChange={(e) => handleFilterChange({ from_date: e.target.value || undefined })}
                  className="h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 font-semibold cursor-pointer text-slate-700"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">To Date</label>
                <input
                  type="date"
                  value={filters.to_date || ""}
                  onChange={(e) => handleFilterChange({ to_date: e.target.value || undefined })}
                  className="h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 font-semibold cursor-pointer text-slate-700"
                />
              </div>
            </>
          )}

          {/* WEEK Filters */}
          {period === "week" && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Month</label>
                <select
                  value={filters.month || ""}
                  onChange={(e) =>
                    handleFilterChange({ month: e.target.value ? Number(e.target.value) : undefined })
                  }
                  className="h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 font-semibold cursor-pointer text-slate-700"
                >
                  <option value="">All Months</option>
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Year</label>
                <select
                  value={filters.year || ""}
                  onChange={(e) =>
                    handleFilterChange({ year: e.target.value ? Number(e.target.value) : undefined })
                  }
                  className="h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 font-semibold cursor-pointer text-slate-700"
                >
                  <option value="">All Years</option>
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">From Date</label>
                <input
                  type="date"
                  value={filters.from_date || ""}
                  onChange={(e) => handleFilterChange({ from_date: e.target.value || undefined })}
                  className="h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 font-semibold cursor-pointer text-slate-700"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">To Date</label>
                <input
                  type="date"
                  value={filters.to_date || ""}
                  onChange={(e) => handleFilterChange({ to_date: e.target.value || undefined })}
                  className="h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 font-semibold cursor-pointer text-slate-700"
                />
              </div>
            </>
          )}

          {/* MONTH Filters */}
          {period === "month" && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Month</label>
                <select
                  value={filters.month || ""}
                  onChange={(e) =>
                    handleFilterChange({ month: e.target.value ? Number(e.target.value) : undefined })
                  }
                  className="h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 font-semibold cursor-pointer text-slate-700"
                >
                  <option value="">All Months</option>
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Year</label>
                <select
                  value={filters.year || ""}
                  onChange={(e) =>
                    handleFilterChange({ year: e.target.value ? Number(e.target.value) : undefined })
                  }
                  className="h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 font-semibold cursor-pointer text-slate-700"
                >
                  <option value="">All Years</option>
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* YEAR Filters */}
          {period === "year" && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Year</label>
              <select
                value={filters.year || ""}
                onChange={(e) =>
                  handleFilterChange({ year: e.target.value ? Number(e.target.value) : undefined })
                }
                className="h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 font-semibold cursor-pointer text-slate-700"
              >
                <option value="">All Years</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Upto Today Toggle */}
          <div className="flex items-center gap-2 pt-4">
            <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={Boolean(filters.upto_today)}
                onChange={(e) => handleFilterChange({ upto_today: e.target.checked || undefined })}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
              />
              <span>Up to Today</span>
            </label>
          </div>
        </div>
      </div>

      {/* 3. Attendance Summary Cards Overview */}
      {!isLoading && !error && activeSummaryItem && (
        <div className="space-y-1.5">
          <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
            Attendance Summary ({activeSummaryItem.name})
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div className="bg-emerald-50/70 border border-emerald-200/80 p-3 rounded-xl">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-extrabold uppercase">PRESENT</span>
                <UserCheck size={14} className="text-emerald-600" />
              </div>
              <div className="text-xl font-black text-emerald-700">
                {activeSummaryItem.presents ?? 0}
              </div>
            </div>

            <div className="bg-rose-50/70 border border-rose-200/80 p-3 rounded-xl">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-extrabold uppercase">ABSENT</span>
                <UserX size={14} className="text-rose-600" />
              </div>
              <div className="text-xl font-black text-rose-700">
                {activeSummaryItem.absents ?? 0}
              </div>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 p-3 rounded-xl">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-extrabold uppercase">HALF DAY</span>
                <Clock size={14} className="text-amber-600" />
              </div>
              <div className="text-xl font-black text-amber-700">
                {activeSummaryItem.halfday ?? 0}
              </div>
            </div>

            <div className="bg-blue-50/70 border border-blue-200/80 p-3 rounded-xl">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-extrabold uppercase">LEAVE</span>
                <CalendarDays size={14} className="text-blue-600" />
              </div>
              <div className="text-xl font-black text-blue-700">
                {activeSummaryItem.leave ?? 0}
              </div>
            </div>

            <div className="bg-purple-50/70 border border-purple-200/80 p-3 rounded-xl">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-extrabold uppercase">HOLIDAY</span>
                <Palmtree size={14} className="text-purple-600" />
              </div>
              <div className="text-xl font-black text-purple-700">
                {activeSummaryItem.holiday ?? 0}
              </div>
            </div>

            <div className="bg-slate-100/80 border border-slate-300/80 p-3 rounded-xl">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-extrabold uppercase">WORKING DAYS</span>
                <Briefcase size={14} className="text-slate-600" />
              </div>
              <div className="text-xl font-black text-slate-800">
                {activeSummaryItem.total_working_days ?? 0}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Report Table View */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-500 font-semibold bg-slate-50/50 rounded-xl border border-slate-200/60">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span>Loading attendance report...</span>
          </div>
        </div>
      ) : error ? (
        <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-6 text-center space-y-3">
          <AlertCircle size={24} className="text-rose-600 mx-auto" />
          <div className="text-xs font-bold text-rose-700">{error}</div>
          <button
            type="button"
            onClick={fetchReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer"
          >
            <RotateCcw size={14} /> Retry
          </button>
        </div>
      ) : !items || items.length === 0 ? (
        <div className="bg-slate-50/60 border border-slate-200/80 rounded-xl p-10 text-center space-y-2">
          <FileText size={24} className="text-slate-400 mx-auto" />
          <div className="text-xs font-extrabold text-slate-700">No attendance records found.</div>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto w-full border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4 text-center">Present</th>
                  <th className="py-3 px-4 text-center">Absent</th>
                  <th className="py-3 px-4 text-center">Half Day</th>
                  <th className="py-3 px-4 text-center">Leave</th>
                  <th className="py-3 px-4 text-center">Holiday</th>
                  <th className="py-3 px-4 text-center">Working Days</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-semibold text-slate-700">
                {items.map((row, idx) => {
                  const isSelected = selectedItemId === row.id;
                  return (
                    <tr
                      key={row.id || idx}
                      onClick={() => setSelectedItemId(row.id)}
                      className={`transition-colors cursor-pointer ${
                        isSelected ? "bg-indigo-50/60 font-bold" : "hover:bg-slate-50/80"
                      }`}
                    >
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-400 shrink-0" />
                          <span>{row.name || row.date}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                          {row.presents}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block font-extrabold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                          {row.absents}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                          {row.halfday}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                          {row.leave}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block font-extrabold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                          {row.holiday}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          {row.total_working_days}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowAction(row);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 border border-indigo-200/60"
                          title={period === "day" ? "View Detailed Daily Log" : "Drill down into days"}
                        >
                          {period === "day" ? (
                            <>
                              <Eye size={13} /> View Log
                            </>
                          ) : (
                            <>
                              <ArrowRight size={13} /> View Days
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="block md:hidden space-y-3 w-full">
            {items.map((row, idx) => (
              <div
                key={`mob-rep-${row.id || idx}`}
                onClick={() => setSelectedItemId(row.id)}
                className={`bg-white border rounded-xl p-3.5 shadow-2xs space-y-2.5 cursor-pointer ${
                  selectedItemId === row.id ? "border-indigo-500 bg-indigo-50/20" : "border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-extrabold text-xs text-slate-900 truncate">
                    {row.name || row.date}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRowAction(row);
                    }}
                    className="px-2.5 py-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/60 rounded-md inline-flex items-center gap-1"
                  >
                    {period === "day" ? "View Log" : "View Days"}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                    <span className="text-[9px] uppercase font-bold text-emerald-600 block">Present</span>
                    <span className="font-extrabold text-emerald-700 text-xs block mt-0.5">{row.presents}</span>
                  </div>
                  <div className="bg-rose-50 p-2 rounded-lg border border-rose-100">
                    <span className="text-[9px] uppercase font-bold text-rose-600 block">Absent</span>
                    <span className="font-extrabold text-rose-700 text-xs block mt-0.5">{row.absents}</span>
                  </div>
                  <div className="bg-slate-100 p-2 rounded-lg border border-slate-200">
                    <span className="text-[9px] uppercase font-bold text-slate-600 block">Working Days</span>
                    <span className="font-extrabold text-slate-800 text-xs block mt-0.5">{row.total_working_days}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 5. Pagination Control */}
          {pagination.total_count > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs">
              <div className="text-slate-500 font-semibold">
                Page <strong className="text-slate-800">{pagination.page}</strong> of{" "}
                <strong className="text-slate-800">{pagination.total_pages}</strong> ({pagination.total_count} records)
              </div>
              <Pagination
                total={pagination.total_count}
                limit={pagination.page_size}
                activePage={pagination.page}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      {/* 6. Detailed Log Modal */}
      <PersonalAttendanceDetailsModal
        isOpen={Boolean(selectedDetailDate)}
        onClose={() => setSelectedDetailDate(null)}
        date={selectedDetailDate}
        currentUserId={currentUserId}
        currentStaffName={currentStaffName}
      />
    </div>
  );
}
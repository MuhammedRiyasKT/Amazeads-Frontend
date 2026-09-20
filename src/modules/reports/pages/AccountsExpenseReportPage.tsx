// src/modules/reports/pages/AccountsExpenseReportPage.tsx

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Calendar,
  RefreshCw,
  AlertCircle,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Filter,
} from "lucide-react";
import { reportsService } from "../services/reports.service";
import {
  PeriodType,
  ExpenseReportItem,
  ExpenseReportParams,
} from "../types/reports.types";
import ExpenseReportDetailsDrawer from "../components/ExpenseReportDetailsDrawer";

const formatINR = (val: number | undefined | null) => {
  if (val === undefined || val === null) return "₹0";
  const formatted = Math.abs(val).toLocaleString("en-IN");
  return val < 0 ? `-₹${formatted}` : `₹${formatted}`;
};

const formatDateReadable = (dateStr?: string) => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

export default function AccountsExpenseReportPage() {
  // ----------------------------------------------------
  // 1. REPORT PERIOD TAB STATE
  // ----------------------------------------------------
  const [periodType, setPeriodType] = useState<PeriodType>("day");

  // ----------------------------------------------------
  // 2. REPORT DATA & PAGINATION STATES
  // ----------------------------------------------------
  const [reports, setReports] = useState<ExpenseReportItem[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ----------------------------------------------------
  // 3. FILTER STATES
  // ----------------------------------------------------
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // ----------------------------------------------------
  // 4. VIEW DETAILS DRAWER STATE
  // ----------------------------------------------------
  const [selectedReport, setSelectedReport] = useState<ExpenseReportItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Fetch Reports Callback
  const loadReports = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params: ExpenseReportParams = {
        periodType,
        page: currentPage,
        page_size: pageSize,
      };

      if (selectedDate) params.date = selectedDate;
      if (selectedMonth) params.month = selectedMonth;
      if (selectedYear) params.year = selectedYear;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;

      const response = await reportsService.getExpenseReport(params);

      if (response && response.data) {
        const items = response.data.items || [];
        setReports(items);

        if (response.data.pagination) {
          setTotalCount(response.data.pagination.total_count || 0);
          setTotalPages(response.data.pagination.total_pages || 1);
        } else {
          setTotalCount(items.length);
          setTotalPages(Math.ceil(items.length / pageSize) || 1);
        }
      } else {
        setReports([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (err: any) {
      console.error("Failed to load expense report:", err);
      setError("Unable to load expense report. Please check network connection or backend service.");
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    periodType,
    currentPage,
    pageSize,
    selectedDate,
    selectedMonth,
    selectedYear,
    fromDate,
    toDate,
  ]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Tab change handler
  const handleTabChange = (newPeriod: PeriodType) => {
    setPeriodType(newPeriod);
    setCurrentPage(1);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedDate("");
    setSelectedMonth("");
    setSelectedYear("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    selectedDate ||
      selectedMonth ||
      selectedYear ||
      fromDate ||
      toDate
  );

  // Drill-down logic: Year -> Month -> Week -> Day
  const handleRowDrillDown = (item: ExpenseReportItem) => {
    if (periodType === "year") {
      let yr = "";
      if (item.date && item.date.length >= 4) {
        yr = item.date.slice(0, 4);
      } else if (item.from_date && item.from_date.length >= 4) {
        yr = item.from_date.slice(0, 4);
      } else if (item.name && /^\d{4}$/.test(item.name.trim())) {
        yr = item.name.trim();
      }
      setPeriodType("month");
      if (yr) setSelectedYear(yr);
      setSelectedMonth("");
      setFromDate("");
      setToDate("");
      setSelectedDate("");
      setCurrentPage(1);
    } else if (periodType === "month") {
      let yr = selectedYear;
      let mo = "";
      if (item.date) {
        const parts = item.date.split("-");
        if (parts.length >= 2) {
          yr = parts[0];
          mo = parts[1];
        }
      } else if (item.from_date) {
        const parts = item.from_date.split("-");
        if (parts.length >= 2) {
          yr = parts[0];
          mo = parts[1];
        }
      }
      setPeriodType("week");
      if (yr) setSelectedYear(yr);
      if (mo) setSelectedMonth(mo);
      if (item.from_date && item.to_date) {
        setFromDate(item.from_date);
        setToDate(item.to_date);
      } else {
        setFromDate("");
        setToDate("");
      }
      setSelectedDate("");
      setCurrentPage(1);
    } else if (periodType === "week") {
      setPeriodType("day");
      if (item.from_date && item.to_date) {
        setFromDate(item.from_date);
        setToDate(item.to_date);
      }
      setSelectedDate("");
      setCurrentPage(1);
    }
  };

  // Options helpers
  const currentYearNum = new Date().getFullYear();
  const yearsOptions = Array.from({ length: 6 }, (_, i) => String(currentYearNum - i));
  const monthsOptions = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const periodColumnTitle = useMemo(() => {
    switch (periodType) {
      case "week":
        return "Week Range";
      case "month":
        return "Month";
      case "year":
        return "Year";
      default:
        return "Day / Date";
    }
  }, [periodType]);

  const drillDownBtnLabel = useMemo(() => {
    if (periodType === "year") return "View Month";
    if (periodType === "month") return "View Week";
    if (periodType === "week") return "View Day";
    return "";
  }, [periodType]);

  return (
    <div className="p-4 md:p-6 space-y-6 w-full min-h-screen text-slate-800">
      
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Expense Report
            </h1>
            <span className="px-2.5 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-lg uppercase tracking-wider">
              Expense Audit
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track expenses and category wise spending across Day, Week, Month, and Year periods.
          </p>
        </div>

        <button
          onClick={loadReports}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 2. PERIOD SELECTOR (SEGMENTED CONTROL) */}
      <div className="bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80 inline-flex flex-wrap items-center gap-1">
        {[
          { id: "day", label: "Day" },
          { id: "week", label: "Week" },
          { id: "month", label: "Month" },
          { id: "year", label: "Year" },
        ].map((tab) => {
          const isActive = periodType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as PeriodType)}
              className={`px-5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                isActive
                  ? "bg-white text-rose-600 shadow-xs border border-slate-200/60"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. RELEVANT DATE FILTERS TOOLBAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
            <Filter size={14} className="text-rose-600" />
            <span>Date Filters ({periodType.toUpperCase()} VIEW)</span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-extrabold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer"
            >
              <X size={13} />
              <span>Clear Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          
          {/* Specific Date (Day mode) */}
          {periodType === "day" && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Specific Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium"
              />
            </div>
          )}

          {/* Date Range: From Date (Day & Week modes) */}
          {(periodType === "day" || periodType === "week") && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium"
              />
            </div>
          )}

          {/* Date Range: To Date (Day & Week modes) */}
          {(periodType === "day" || periodType === "week") && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium"
              />
            </div>
          )}

          {/* Month Select (Day, Week & Month modes) */}
          {(periodType === "day" || periodType === "week" || periodType === "month") && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-semibold"
              >
                <option value="">All Months</option>
                {monthsOptions.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Year Select (All modes) */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-semibold"
            >
              <option value="">All Years</option>
              {yearsOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* ERROR ALERT STATE */}
      {error && !isLoading && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
          <button
            onClick={loadReports}
            className="px-4 py-2 font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* 4. DETAILED REPORT TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        {isLoading ? (
          /* SKELETON LOADING STATE */
          <div className="p-6 space-y-4">
            <div className="h-6 bg-slate-100 rounded-lg w-1/4 animate-pulse"></div>
            <div className="space-y-3 pt-2">
              {[1, 2, 3, 4, 5].map((idx) => (
                <div key={idx} className="h-12 bg-slate-100/70 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
        ) : reports.length === 0 ? (
          /* EMPTY STATE */
          <div className="p-12 md:p-16 flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 bg-slate-50 text-slate-400 rounded-full border border-slate-100">
              <Calendar className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">No Expense Data Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try changing the selected period or date filters to view expense reports.
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          /* DATA TABLE */
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[650px] text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5 border-r border-slate-200/60">{periodColumnTitle}</th>
                  <th className="px-4 py-3.5 border-r border-slate-200/60 text-right">Expenses</th>
                  <th className="px-4 py-3.5 border-r border-slate-200/60 text-right">Expense Amount</th>
                  <th className="px-4 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {reports.map((item, index) => (
                  <tr key={item.id || item.date || index} className="hover:bg-slate-50/70 transition-colors">
                    {/* Period Name / Dates */}
                    <td className="px-4 py-3.5 border-r border-slate-200/60 font-bold text-slate-900">
                      <div>
                        <span className="block text-slate-900 font-bold text-xs">{item.name || item.date}</span>
                        {(item.from_date || item.to_date) && item.from_date !== item.name && (
                          <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">
                            {formatDateReadable(item.from_date)} – {formatDateReadable(item.to_date)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Expenses Count */}
                    <td className="px-4 py-3.5 border-r border-slate-200/60 text-right font-semibold text-slate-700">
                      {item.expenses_count ?? item.expense_count ?? 0}
                    </td>

                    {/* Expense Amount */}
                    <td className="px-4 py-3.5 border-r border-slate-200/60 text-right font-black text-rose-600">
                      {formatINR(item.expense_amount)}
                    </td>

                    {/* Actions Column: View (open drawer) and View Month/Week/Day (drill down) */}
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedReport(item);
                            setIsDrawerOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>

                        {periodType !== "day" && (
                          <button
                            onClick={() => handleRowDrillDown(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
                          >
                            <span>{drillDownBtnLabel}</span>
                            <ArrowRight size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SERVER-SIDE PAGINATION FOOTER */}
        {!isLoading && reports.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-500 font-semibold">
              Showing <strong className="text-slate-900">{(currentPage - 1) * pageSize + 1}</strong> to{" "}
              <strong className="text-slate-900">{Math.min(currentPage * pageSize, totalCount)}</strong> of{" "}
              <strong className="text-slate-900">{totalCount}</strong> reports
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage <= 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>

              {/* Page Number Buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))
                .map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW DETAILS DRAWER */}
      <ExpenseReportDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        report={selectedReport}
      />
    </div>
  );
}

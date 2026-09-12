// src/modules/reports/pages/AccountsExpenseReportPage.tsx

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Receipt,
  Clock3,
  Calendar,
  RefreshCw,
  AlertCircle,
  Eye,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Landmark,
  Layers,
  FileText,
  Calculator,
} from "lucide-react";
import { reportsService } from "../services/reports.service";
import {
  PeriodType,
  ExpenseReportItem,
  ExpenseReportParams,
  ExpenseReportCategoryBreakdown,
  ExpenseReportAccountBreakdown,
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
  const [pageSize] = useState<number>(5);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ----------------------------------------------------
  // 3. FILTER STATES
  // ----------------------------------------------------
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [uptoToday, setUptoToday] = useState<boolean>(false);

  const [expenseCategoryId, setExpenseCategoryId] = useState<string>("");
  const [staffId, setStaffId] = useState<string>("");

  // ----------------------------------------------------
  // 4. DROPDOWN OPTIONS DATA
  // ----------------------------------------------------
  const [expenseCategories, setExpenseCategories] = useState<{ id: number; category_name: string }[]>([]);
  const [staffList, setStaffList] = useState<{ id: number; staff_name: string }[]>([]);

  // ----------------------------------------------------
  // 5. VIEW DETAILS DRAWER STATE
  // ----------------------------------------------------
  const [selectedReport, setSelectedReport] = useState<ExpenseReportItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Load Dropdown Options on Mount
  useEffect(() => {
    let isMounted = true;
    reportsService.getExpenseCategories().then((cats) => {
      if (isMounted) setExpenseCategories(cats || []);
    }).catch(() => {});

    reportsService.getStaffList().then((staffs) => {
      if (isMounted) setStaffList(staffs || []);
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

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
      if (selectedDay) params.day = selectedDay;
      if (selectedMonth) params.month = selectedMonth;
      if (selectedYear) params.year = selectedYear;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      if (uptoToday) params.upto_today = true;
      if (expenseCategoryId) params.expense_category_id = expenseCategoryId;
      if (staffId) params.staff_id = staffId;

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
    selectedDay,
    selectedMonth,
    selectedYear,
    fromDate,
    toDate,
    uptoToday,
    expenseCategoryId,
    staffId,
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
    setSelectedDay("");
    setSelectedMonth("");
    setSelectedYear("");
    setFromDate("");
    setToDate("");
    setUptoToday(false);
    setExpenseCategoryId("");
    setStaffId("");
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    selectedDate ||
      selectedDay ||
      selectedMonth ||
      selectedYear ||
      fromDate ||
      toDate ||
      uptoToday ||
      expenseCategoryId ||
      staffId
  );

  // Compute Period Totals for Loaded Items (using PERIOD values only!)
  const periodSummary = useMemo(() => {
    if (!reports || reports.length === 0) {
      return {
        expenseAmount: 0,
        expensesCount: 0,
        averageExpense: 0,
        overallExpense: 0,
      };
    }

    const totalPeriodAmount = reports.reduce((sum, item) => sum + (item.expense_amount || 0), 0);
    const totalPeriodCount = reports.reduce((sum, item) => sum + (item.expenses_count || 0), 0);
    const avg = totalPeriodCount > 0 ? totalPeriodAmount / totalPeriodCount : 0;
    
    // Overall / Cumulative Expense from first item if present
    const overall = reports[0]?.total_expense_amount ?? totalPeriodAmount;

    return {
      expenseAmount: totalPeriodAmount,
      expensesCount: totalPeriodCount,
      averageExpense: avg,
      overallExpense: overall,
    };
  }, [reports]);

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
        return "Period / Date";
    }
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
            Track expenses, categories, accounts and period-wise spending.
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

      {/* 3. FILTER TOOLBAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          
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

          {/* Month Select */}
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

          {/* Year Select */}
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

          {/* Expense Category Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Expense Category
            </label>
            <select
              value={expenseCategoryId}
              onChange={(e) => {
                setExpenseCategoryId(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-semibold"
            >
              <option value="">All Expense Categories</option>
              {expenseCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>

          {/* Staff Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Staff Member
            </label>
            <select
              value={staffId}
              onChange={(e) => {
                setStaffId(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-semibold"
            >
              <option value="">All Staff Members</option>
              {staffList.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.staff_name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range: From Date */}
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

          {/* Date Range: To Date */}
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

          {/* Quick Buttons */}
          <div className="flex items-center gap-2 pt-4">
            <button
              onClick={() => {
                setUptoToday(!uptoToday);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                uptoToday
                  ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
              }`}
            >
              Up to Today
            </button>

            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer"
              >
                <X size={13} />
                <span>Clear</span>
              </button>
            )}
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

      {/* 4. EXPENSE KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Expense Amount */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Expense Amount
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Receipt size={16} />
            </div>
          </div>
          <div>
            <span className="text-xl md:text-2xl font-black text-rose-600 block">
              {isLoading ? "—" : formatINR(periodSummary.expenseAmount)}
            </span>
            <span className="text-[10px] font-bold text-rose-700/70 mt-0.5 block">
              Period Spending
            </span>
          </div>
        </div>

        {/* Expenses Count */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Expenses Count
            </span>
            <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
              <Clock3 size={16} />
            </div>
          </div>
          <div>
            <span className="text-xl md:text-2xl font-black text-slate-900 block">
              {isLoading ? "—" : periodSummary.expensesCount}
            </span>
            <span className="text-[10px] font-bold text-slate-400 mt-0.5 block">
              Total Transactions
            </span>
          </div>
        </div>

        {/* Average Expense */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Average Expense
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Calculator size={16} />
            </div>
          </div>
          <div>
            <span className="text-xl md:text-2xl font-black text-indigo-900 block">
              {isLoading ? "—" : formatINR(periodSummary.averageExpense)}
            </span>
            <span className="text-[10px] font-bold text-indigo-700/70 mt-0.5 block">
              Per Expense Avg
            </span>
          </div>
        </div>

        {/* Overall Expense */}
        <div className="bg-slate-900 text-white border border-slate-900 rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
              Overall Expense
            </span>
            <div className="p-2 bg-white/10 rounded-xl text-white">
              <Receipt size={16} />
            </div>
          </div>
          <div>
            <span className="text-xl md:text-2xl font-black block">
              {isLoading ? "—" : formatINR(periodSummary.overallExpense)}
            </span>
            <span className="text-[10px] font-medium opacity-80 mt-0.5 block">
              System Cumulative
            </span>
          </div>
        </div>
      </div>

      {/* 5. DETAILED REPORT TABLE */}
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
                Try changing the selected period or filters to view expense reports.
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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5 border-r border-slate-200/60">{periodColumnTitle}</th>
                  <th className="px-4 py-3.5 border-r border-slate-200/60 text-right">Expenses</th>
                  <th className="px-4 py-3.5 border-r border-slate-200/60 text-right">Expense Amount</th>
                  <th className="px-4 py-3.5 border-r border-slate-200/60 text-center">Status</th>
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
                      {item.expenses_count ?? 0}
                    </td>

                    {/* Expense Amount */}
                    <td className="px-4 py-3.5 border-r border-slate-200/60 text-right font-black text-rose-600">
                      {formatINR(item.expense_amount)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 border-r border-slate-200/60 text-center">
                      <span className="inline-block px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.status || "generated"}
                      </span>
                    </td>

                    {/* Action - View */}
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => {
                          setSelectedReport(item);
                          setIsDrawerOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </button>
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

// src/modules/accounts/pages/DailyEntryPage.tsx

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ClipboardCheck,
  RefreshCw,
  AlertCircle,
  Calendar,
  Filter,
  X,
  TrendingUp,
  Wallet,
  Clock3,
  Receipt,
  ArrowUpDown,
  Landmark,
  Users,
  ShoppingBag,
  Ban,
  Layers,
  ChevronDown,
  ChevronUp,
  UserCheck,
} from "lucide-react";
import { reportsService } from "@/modules/reports";
import {
  SalesExpenseReportItem,
  StaffReport,
  StaffWiseReportItem,
  SalesExpenseReportParams,
  StaffWiseReportParams,
} from "@/modules/reports/types/reports.types";

const formatINR = (val: number | undefined | null) => {
  if (val === undefined || val === null || isNaN(val)) return "₹0";
  const formatted = Math.abs(val).toLocaleString("en-IN");
  return val < 0 ? `-₹${formatted}` : `₹${formatted}`;
};

const formatDateReadable = (dateStr?: string) => {
  if (!dateStr) return "Today";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

// Get today's local date string in YYYY-MM-DD format
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function DailyEntryPage() {
  // Dynamic today date state
  const todayDateStr = useMemo(() => getTodayDateString(), []);

  // ----------------------------------------------------
  // 1. DATA STATES (API 1 & API 2)
  // ----------------------------------------------------
  const [dailyReportItem, setDailyReportItem] = useState<SalesExpenseReportItem | null>(null);
  const [staffReports, setStaffReports] = useState<StaffReport[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ----------------------------------------------------
  // 2. FILTER STATES
  // ----------------------------------------------------
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");

  // Dropdown options
  const [salesCategories, setSalesCategories] = useState<{ id: number; category_name: string }[]>([]);
  const [staffList, setStaffList] = useState<{ id: number; staff_name: string }[]>([]);

  // Expanded staff row ID for staff details
  const [expandedStaffId, setExpandedStaffId] = useState<number | null>(null);

  // Load dropdown options on mount
  useEffect(() => {
    let isMounted = true;
    reportsService
      .getSalesCategories()
      .then((cats) => {
        if (isMounted) setSalesCategories(cats || []);
      })
      .catch(() => {});

    reportsService
      .getSalesStaffList()
      .then((staffs) => {
        if (isMounted) setStaffList(staffs || []);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Load Data Callback for Both APIs
  const loadDailyData = useCallback(
    async (showRefreshing = false) => {
      try {
        if (showRefreshing) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        // Params for API 1 (Sales & Expense)
        const api1Params: SalesExpenseReportParams = {
          periodType: "day",
          date: todayDateStr,
        };
        if (selectedCategoryId) api1Params.category_id = selectedCategoryId;
        if (selectedStaffId) api1Params.staff_id = selectedStaffId;

        // Params for API 2 (Staff-wise Sales)
        const api2Params: StaffWiseReportParams = {
          date: todayDateStr,
        };
        if (selectedCategoryId) api2Params.category_id = selectedCategoryId;
        if (selectedStaffId) api2Params.staff_id = selectedStaffId;

        // Call both APIs concurrently
        const [res1, res2] = await Promise.all([
          reportsService.getSalesExpenseReport(api1Params),
          reportsService.getStaffWiseDailyReport(api2Params),
        ]);

        // Process API 1 data
        if (res1 && res1.data && res1.data.items && res1.data.items.length > 0) {
          setDailyReportItem(res1.data.items[0]);
        } else {
          setDailyReportItem(null);
        }

        // Process API 2 data
        if (res2 && res2.data && res2.data.items && res2.data.items.length > 0) {
          setStaffReports(res2.data.items[0].staff_reports || []);
        } else {
          setStaffReports([]);
        }
      } catch (err: any) {
        console.error("Failed to load today's daily entry:", err);
        setError("Unable to load today's daily entry data. Please check network or backend server.");
        setDailyReportItem(null);
        setStaffReports([]);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [todayDateStr, selectedCategoryId, selectedStaffId]
  );

  useEffect(() => {
    loadDailyData();
  }, [loadDailyData]);

  // Clear filters handler
  const handleClearFilters = () => {
    setSelectedCategoryId("");
    setSelectedStaffId("");
  };

  const hasActiveFilters = Boolean(selectedCategoryId || selectedStaffId);

  // Derived breakdowns from API 1 item
  const accountBreakdown = useMemo(() => {
    if (!dailyReportItem) return [];
    return dailyReportItem.account_breakdown || dailyReportItem.total_account_breakdown || [];
  }, [dailyReportItem]);

  const expenseCategoryBreakdown = useMemo(() => {
    if (!dailyReportItem) return [];
    return (
      dailyReportItem.expense_category_breakdown ||
      dailyReportItem.total_expense_category_breakdown ||
      []
    );
  }, [dailyReportItem]);

  const salesCategoryBreakdown = useMemo(() => {
    if (!dailyReportItem) return [];
    return dailyReportItem.sales_category_breakdown || dailyReportItem.total_sales_category_breakdown || [];
  }, [dailyReportItem]);

  return (
    <div className="p-4 md:p-6 space-y-6 w-full font-sans text-slate-800 min-h-screen">
      
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6 text-indigo-600" />
              <span>Daily Entry</span>
            </h1>

            {/* Dynamic Today Date Indicator */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-extrabold rounded-full">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>{formatDateReadable(todayDateStr)}</span>
              <span className="text-[10px] text-indigo-400 font-medium">({todayDateStr})</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Today's sales, collection, expenses and staff performance summary
          </p>
        </div>

        {/* Refresh Action */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => loadDailyData(true)}
            disabled={isLoading || isRefreshing}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. COMPACT FILTER TOOLBAR (CATEGORY & STAFF ONLY) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
            <Filter size={14} className="text-indigo-600" />
            <span>Filters:</span>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-slate-800 cursor-pointer min-w-[160px]"
            >
              <option value="">All Categories</option>
              {salesCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>

          {/* Staff Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-slate-800 cursor-pointer min-w-[160px]"
            >
              <option value="">All Sales Staff</option>
              {staffList.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.staff_name}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
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

        {/* Live Filter Indicator */}
        <div className="text-[11px] font-semibold text-slate-400">
          Showing data for <strong className="text-slate-700">{formatDateReadable(todayDateStr)}</strong>
        </div>
      </div>

      {/* 3. MAIN CONTENT / LOADING / ERROR / EMPTY STATES */}
      {isLoading ? (
        /* LOADING SKELETON */
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-slate-100 rounded-2xl" />
            <div className="h-64 bg-slate-100 rounded-2xl" />
          </div>
          <div className="h-64 bg-slate-100 rounded-2xl" />
        </div>
      ) : error ? (
        /* ERROR STATE */
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-4 shadow-2xs">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-full border border-rose-100">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Unable to load today's daily entry</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">{error}</p>
          </div>
          <button
            onClick={() => loadDailyData()}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Try Again
          </button>
        </div>
      ) : !dailyReportItem && staffReports.length === 0 ? (
        /* EMPTY STATE */
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-2xs">
          <div className="p-4 bg-slate-50 text-slate-400 rounded-full border border-slate-100">
            <Calendar className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Daily Entry Available for Today</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No transactions or staff sales records have been recorded for {formatDateReadable(todayDateStr)}.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* 4. TODAY'S OVERVIEW KPI SUMMARY CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* 1. Total Sales */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Sales
                </span>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <TrendingUp size={16} />
                </div>
              </div>
              <div>
                <span className="text-lg md:text-xl font-black text-slate-900 block">
                  {formatINR(dailyReportItem?.sales_amount)}
                </span>
                <span className="text-[10px] font-bold text-slate-400 mt-0.5 block">
                  Orders: {dailyReportItem?.orders ?? 0}
                </span>
              </div>
            </div>

            {/* 2. Cash Collection */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Cash Collection
                </span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Wallet size={16} />
                </div>
              </div>
              <div>
                <span className="text-lg md:text-xl font-black text-emerald-600 block">
                  {formatINR(dailyReportItem?.cash_collection)}
                </span>
                <span className="text-[10px] font-bold text-emerald-700/70 mt-0.5 block">
                  Cash Received
                </span>
              </div>
            </div>

            {/* 3. Pending Amount */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Pending Amount
                </span>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <Clock3 size={16} />
                </div>
              </div>
              <div>
                <span className="text-lg md:text-xl font-black text-amber-600 block">
                  {formatINR(dailyReportItem?.orders_pending)}
                </span>
                <span className="text-[10px] font-bold text-amber-700/70 mt-0.5 block">
                  Uncollected Balance
                </span>
              </div>
            </div>

            {/* 4. Total Expenses */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Expenses
                </span>
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <Receipt size={16} />
                </div>
              </div>
              <div>
                <span className="text-lg md:text-xl font-black text-rose-600 block">
                  {formatINR(dailyReportItem?.expense_amount)}
                </span>
                <span className="text-[10px] font-bold text-rose-700/70 mt-0.5 block">
                  Count: {dailyReportItem?.expenses_count ?? 0}
                </span>
              </div>
            </div>

            {/* 5. Net Amount */}
            <div
              className={`col-span-2 sm:col-span-1 border rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-2 ${
                (dailyReportItem?.net_amount ?? 0) < 0
                  ? "bg-rose-500 text-white border-rose-600"
                  : "bg-slate-900 text-white border-slate-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  Net Amount
                </span>
                <div className="p-2 bg-white/10 rounded-xl text-white">
                  <ArrowUpDown size={16} />
                </div>
              </div>
              <div>
                <span className="text-lg md:text-xl font-black block">
                  {formatINR(dailyReportItem?.net_amount)}
                </span>
                <span className="text-[10px] font-medium opacity-80 mt-0.5 block">
                  Collection − Expense
                </span>
              </div>
            </div>
          </div>

          {/* 5. TODAY'S DETAILED SALES & EXPENSES (GRID OF 2 CARDS) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* TODAY'S SALES BREAKDOWN CARD */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Today's Sales Breakdown
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                  {dailyReportItem?.orders ?? 0} Orders
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Sales Billed</span>
                  <strong className="text-sm font-black text-slate-900">{formatINR(dailyReportItem?.sales_amount)}</strong>
                </div>

                <div className="bg-emerald-50/50 border border-emerald-150 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase block">Cash Collection</span>
                  <strong className="text-sm font-black text-emerald-900">{formatINR(dailyReportItem?.cash_collection)}</strong>
                </div>

                <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Orders Collection</span>
                  <strong className="text-sm font-bold text-slate-800">{formatINR(dailyReportItem?.orders_collection)}</strong>
                </div>

                <div className="bg-amber-50/50 border border-amber-150 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-amber-600 uppercase block">Pending Balance</span>
                  <strong className="text-sm font-black text-amber-900">{formatINR(dailyReportItem?.orders_pending)}</strong>
                </div>

                <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Live Collection</span>
                  <strong className="text-sm font-bold text-slate-800">{formatINR(dailyReportItem?.live_orders_collection)}</strong>
                </div>

                <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Live Pending</span>
                  <strong className="text-sm font-bold text-slate-800">{formatINR(dailyReportItem?.live_orders_pending)}</strong>
                </div>
              </div>

              {/* Cancelled Orders Info Strip */}
              {(dailyReportItem?.orders_cancelled ?? 0) > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-900">
                  <div className="flex items-center gap-2">
                    <Ban className="w-4 h-4 text-rose-600" />
                    <span className="font-bold">Cancelled Orders Today: {dailyReportItem?.orders_cancelled}</span>
                  </div>
                  <strong className="font-black text-rose-700">{formatINR(dailyReportItem?.cancelled_orders_amount)}</strong>
                </div>
              )}
            </div>

            {/* TODAY'S EXPENSE BREAKDOWN CARD */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-rose-600" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Today's Expenses
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md">
                    {dailyReportItem?.expenses_count ?? 0} Transactions
                  </span>
                  <strong className="text-xs font-black text-rose-600">
                    {formatINR(dailyReportItem?.expense_amount)}
                  </strong>
                </div>
              </div>

              {expenseCategoryBreakdown.length > 0 ? (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] border-b border-slate-200">
                      <tr>
                        <th className="px-3.5 py-2.5">Category Name</th>
                        <th className="px-3.5 py-2.5 text-right">Count</th>
                        <th className="px-3.5 py-2.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white font-medium">
                      {expenseCategoryBreakdown.map((cat, idx) => (
                        <tr key={cat.category_id || idx} className="hover:bg-slate-50/60">
                          <td className="px-3.5 py-2.5 font-bold text-slate-800">{cat.category_name}</td>
                          <td className="px-3.5 py-2.5 text-right font-medium text-slate-600">
                            {cat.expenses_count ?? cat.total_expenses_count ?? 1}
                          </td>
                          <td className="px-3.5 py-2.5 text-right font-black text-rose-600">
                            {formatINR(cat.expense_amount ?? cat.total_expense_amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-slate-100">
                  No expense records logged for today.
                </div>
              )}
            </div>

          </div>

          {/* 6. ACCOUNT SUMMARY SECTION */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-slate-700" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Account Summary
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                {accountBreakdown.length} Accounts
              </span>
            </div>

            {accountBreakdown.length > 0 ? (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Account Name</th>
                      <th className="px-4 py-3 text-right">Cash Collection</th>
                      <th className="px-4 py-3 text-right">Expense Amount</th>
                      <th className="px-4 py-3 text-right">Net Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white font-semibold">
                    {accountBreakdown.map((acc, idx) => {
                      const netIsNeg = (acc.net_amount || 0) < 0;
                      return (
                        <tr key={acc.account_id || idx} className="hover:bg-slate-50/60">
                          <td className="px-4 py-3 font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                            <span>{acc.account_name}</span>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-emerald-600">
                            {formatINR(acc.cash_collection)}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-rose-600">
                            {formatINR(acc.expense_amount)}
                          </td>
                          <td
                            className={`px-4 py-3 text-right font-black ${
                              netIsNeg ? "text-rose-600" : "text-slate-900"
                            }`}
                          >
                            {formatINR(acc.net_amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-slate-100">
                No account breakdown data for today.
              </div>
            )}
          </div>

          {/* 7. STAFF-WISE SALES SECTION (API 2 DATA) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Staff-wise Sales Performance
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                {staffReports.length} Staff Members
              </span>
            </div>

            {staffReports.length > 0 ? (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Staff Name</th>
                      <th className="px-4 py-3 text-right">Orders</th>
                      <th className="px-4 py-3 text-right">Sales Amount</th>
                      <th className="px-4 py-3 text-right">Cash Collection</th>
                      <th className="px-4 py-3 text-right">Pending</th>
                      <th className="px-4 py-3 text-right">Cancelled</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white font-medium">
                    {staffReports.map((st) => {
                      const isInactive = st.orders === 0 && st.sales_amount === 0 && st.cash_collection === 0;
                      const isExpanded = expandedStaffId === st.staff_id;

                      return (
                        <React.Fragment key={st.staff_id}>
                          <tr
                            className={`transition-colors ${
                              isInactive ? "opacity-60 bg-slate-50/40" : "hover:bg-indigo-50/30"
                            }`}
                          >
                            <td className="px-4 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                              <div className="p-1 bg-slate-100 rounded-md text-slate-600">
                                <UserCheck size={13} />
                              </div>
                              <span>{st.staff_name}</span>
                            </td>

                            <td className="px-4 py-3.5 text-right font-bold text-slate-800">
                              {st.orders}
                            </td>

                            <td className="px-4 py-3.5 text-right font-black text-indigo-900">
                              {formatINR(st.sales_amount)}
                            </td>

                            <td className="px-4 py-3.5 text-right font-bold text-emerald-600">
                              {formatINR(st.cash_collection)}
                            </td>

                            <td className="px-4 py-3.5 text-right font-semibold text-amber-600">
                              {formatINR(st.orders_pending)}
                            </td>

                            <td className="px-4 py-3.5 text-right font-semibold text-rose-600">
                              {st.orders_cancelled ?? 0}
                            </td>

                            <td className="px-4 py-3.5 text-center">
                              <button
                                onClick={() =>
                                  setExpandedStaffId(isExpanded ? null : st.staff_id)
                                }
                                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="Toggle details"
                              >
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                            </td>
                          </tr>

                          {/* Expanded Row Breakdown */}
                          {isExpanded && (
                            <tr className="bg-indigo-50/20">
                              <td colSpan={7} className="p-4 border-t border-slate-150">
                                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                    {st.staff_name}'s Detailed Performance
                                  </h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                    <div className="bg-slate-50 p-2.5 rounded-lg border">
                                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Orders Collection</span>
                                      <strong className="font-bold text-slate-800">{formatINR(st.orders_collection)}</strong>
                                    </div>
                                    <div className="bg-slate-50 p-2.5 rounded-lg border">
                                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Live Collection</span>
                                      <strong className="font-bold text-slate-800">{formatINR(st.live_orders_collection)}</strong>
                                    </div>
                                    <div className="bg-slate-50 p-2.5 rounded-lg border">
                                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Live Pending</span>
                                      <strong className="font-bold text-slate-800">{formatINR(st.live_orders_pending)}</strong>
                                    </div>
                                    <div className="bg-slate-50 p-2.5 rounded-lg border">
                                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Cancelled Amount</span>
                                      <strong className="font-bold text-rose-600">{formatINR(st.cancelled_orders_amount)}</strong>
                                    </div>
                                  </div>

                                  {/* Staff Sales Category Breakdown */}
                                  {st.sales_category_breakdown && st.sales_category_breakdown.length > 0 && (
                                    <div className="pt-2 space-y-1.5">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Category Breakdown</span>
                                      <div className="flex flex-wrap gap-2">
                                        {st.sales_category_breakdown.map((cat, i) => (
                                          <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-800 font-semibold text-xs rounded-lg border">
                                            {cat.category_name}: {formatINR(cat.sales_amount)}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-slate-100">
                No staff-wise sales data available for today.
              </div>
            )}
          </div>

          {/* 8. SALES CATEGORY BREAKDOWN SECTION (IF AVAILABLE) */}
          {salesCategoryBreakdown.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Today's Sales Category Performance
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {salesCategoryBreakdown.length} Categories
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Category Name</th>
                      <th className="px-4 py-3 text-right">Orders</th>
                      <th className="px-4 py-3 text-right">Sales Amount</th>
                      <th className="px-4 py-3 text-right">Cash Collection</th>
                      <th className="px-4 py-3 text-right">Pending Balance</th>
                      <th className="px-4 py-3 text-right">Cancelled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white font-medium">
                    {salesCategoryBreakdown.map((cat, idx) => (
                      <tr key={cat.category_id || idx} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-bold text-slate-900">{cat.category_name}</td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-700">{cat.orders ?? cat.total_orders ?? 0}</td>
                        <td className="px-4 py-3 text-right font-black text-indigo-900">{formatINR(cat.sales_amount ?? cat.total_sales_amount)}</td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-600">{formatINR(cat.cash_collection ?? cat.orders_collection ?? cat.total_cash_collection)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-amber-600">{formatINR(cat.orders_pending ?? cat.total_cash_pending)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-rose-600">{cat.orders_cancelled ?? cat.total_orders_cancelled ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </>
      )}

    </div>
  );
}

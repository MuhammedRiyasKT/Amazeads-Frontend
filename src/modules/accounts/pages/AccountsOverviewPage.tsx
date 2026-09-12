// src/modules/accounts/pages/AccountsOverviewPage.tsx

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Wallet,
  Clock3,
  Receipt,
  ArrowUpDown,
  ShoppingBag,
  Landmark,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Bell,
  Ban,
  Layers,
  Calendar,
  PieChart,
} from "lucide-react";
import { reportsService } from "@/modules/reports";
import { SalesExpenseReportItem } from "@/modules/reports/types/reports.types";
import { listCompliances } from "@/modules/compliances/services/compliances.service";
import { Compliance } from "@/modules/compliances/types/compliances.types";

const formatINR = (val: number | undefined | null) => {
  if (val === undefined || val === null || isNaN(val)) return "₹0";
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

const getCurrentMonthAndYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const monthNum = now.getMonth() + 1;
  const month = String(monthNum).padStart(2, "0");
  const monthName = now.toLocaleString("en-US", { month: "long" });
  return { month, year, monthName };
};

export default function AccountsOverviewPage() {
  const [reportItem, setReportItem] = useState<SalesExpenseReportItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Compliance Reminders State
  const [compliances, setCompliances] = useState<Compliance[]>([]);
  const [compliancesLoading, setCompliancesLoading] = useState<boolean>(true);

  // Current Month and Year (Dynamic)
  const { month, year, monthName } = useMemo(() => getCurrentMonthAndYear(), []);

  // Fetch Monthly Financial Overview
  const loadMonthlyReport = useCallback(
    async (showRefreshing = false) => {
      try {
        if (showRefreshing) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        const res = await reportsService.getSalesExpenseReport({
          periodType: "month",
          month,
          year,
        });

        if (res && res.data && res.data.items && res.data.items.length > 0) {
          setReportItem(res.data.items[0]);
        } else {
          setReportItem(null);
        }
      } catch (err: unknown) {
        console.error("Failed to load this month's accounts overview:", err);
        setError("Unable to load this month's accounts overview.");
        setReportItem(null);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [month, year]
  );

  // Fetch Compliance Reminders
  const fetchComplianceReminders = useCallback(async () => {
    try {
      setCompliancesLoading(true);
      const res = await listCompliances("accounts", { not_completed: true, page_size: 6 });
      setCompliances(res.items || []);
    } catch (err: unknown) {
      console.error("Failed to load compliance reminders:", err);
    } finally {
      setCompliancesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMonthlyReport();
    fetchComplianceReminders();
  }, [loadMonthlyReport, fetchComplianceReminders]);

  const getReminderUrgency = useCallback((comp: Compliance) => {
    const isCompleted = comp.status === "Completed";
    if (isCompleted) {
      return {
        label: "Completed",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dotClass: "bg-emerald-500",
      };
    }

    const targetDateStr = comp.reminder_date || comp.due_date;
    if (!targetDateStr) {
      return {
        label: "No date",
        badgeClass: "bg-slate-50 text-slate-600 border-slate-200",
        dotClass: "bg-slate-400",
      };
    }

    const targetDate = new Date(targetDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0 || comp.is_overdue || comp.status === "Overdue") {
      const overdueDays = Math.abs(diffDays);
      return {
        label: overdueDays > 0 ? `${overdueDays} days overdue` : "Overdue",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200 font-bold",
        dotClass: "bg-rose-500 animate-pulse",
      };
    }

    if (diffDays === 0) {
      return {
        label: "Due Today",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200 font-bold",
        dotClass: "bg-amber-500",
      };
    }

    if (diffDays <= 5) {
      return {
        label: `${diffDays} days left`,
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200 font-semibold",
        dotClass: "bg-amber-400",
      };
    }

    return {
      label: `${diffDays} days left`,
      badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold",
      dotClass: "bg-indigo-500",
    };
  }, []);

  // 1. CURRENT MONTH Derived Breakdowns
  const monthSalesCategoryBreakdown = useMemo(
    () => reportItem?.sales_category_breakdown || [],
    [reportItem]
  );
  const monthAccountBreakdown = useMemo(
    () => reportItem?.account_breakdown || [],
    [reportItem]
  );
  const monthExpenseCategoryBreakdown = useMemo(
    () => reportItem?.expense_category_breakdown || [],
    [reportItem]
  );

  const totalCategoryCollection = useMemo(() => {
    return monthSalesCategoryBreakdown.reduce(
      (sum, cat) => sum + (cat.cash_collection || 0),
      0
    );
  }, [monthSalesCategoryBreakdown]);

  const categoryPalette = useMemo(
    () => ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"],
    []
  );

  const categoryBgPills = useMemo(
    () => [
      "bg-indigo-50 text-indigo-700 border-indigo-200",
      "bg-emerald-50 text-emerald-700 border-emerald-200",
      "bg-amber-50 text-amber-700 border-amber-200",
      "bg-pink-50 text-pink-700 border-pink-200",
    ],
    []
  );

  const donutItems = useMemo(() => {
    const radius = 38;
    const circumference = 2 * Math.PI * radius; // ~238.761
    let accumulatedOffset = 0;

    return monthSalesCategoryBreakdown.map((cat, idx) => {
      const pct = totalCategoryCollection > 0
        ? (cat.cash_collection || 0) / totalCategoryCollection
        : 0;
      const dashLength = pct * circumference;
      const dashOffset = accumulatedOffset;
      accumulatedOffset += dashLength;

      const pctInteger = totalCategoryCollection > 0
        ? Math.round(pct * 100)
        : 0;

      return {
        ...cat,
        pct,
        pctInteger,
        dashLength,
        dashOffset,
        color: categoryPalette[idx % categoryPalette.length],
        pillClass: categoryBgPills[idx % categoryBgPills.length],
      };
    });
  }, [monthSalesCategoryBreakdown, totalCategoryCollection, categoryPalette, categoryBgPills]);

  return (
    <div className="p-4 md:p-6 space-y-8 w-full font-sans text-slate-800 min-h-screen">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Accounts Overview
            </h1>
            <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-extrabold rounded-md uppercase tracking-wider">
              Finance
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Monitor this month's sales, collections, expenses, account balances, and cumulative performance.
          </p>
        </div>

        {/* Dynamic Current Month Badge & Refresh Action */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="inline-flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-extrabold rounded-xl shadow-2xs">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>{reportItem?.name || `${monthName} ${year}`}</span>
            </div>
            {reportItem?.from_date && reportItem?.to_date && (
              <span className="text-[10px] text-indigo-500 font-semibold">
                ({formatDateReadable(reportItem.from_date)} – {formatDateReadable(reportItem.to_date)})
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => loadMonthlyReport(true)}
            disabled={isLoading || isRefreshing}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. ERROR BANNER */}
      {error && !isLoading && (
        <div className="flex items-center justify-between p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded-2xl shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadMonthlyReport()}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* 3. MAIN CONTENT / LOADING / EMPTY STATE */}
      {isLoading ? (
        /* LOADING SKELETON */
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-slate-100 rounded-2xl" />
            <div className="h-64 bg-slate-100 rounded-2xl" />
          </div>
        </div>
      ) : !reportItem ? (
        /* EMPTY STATE FOR FINANCIAL DATA */
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-3 shadow-2xs">
          <div className="p-3 bg-slate-50 text-slate-400 rounded-full border border-slate-100">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            No financial data available for this month.
          </h3>
          <p className="text-xs text-slate-500 max-w-sm">
            No transaction records were found for {monthName} {year}.
          </p>
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* MAJOR SECTION 1: CURRENT MONTH DATA */}
          {/* ========================================================================= */}
          <div className="space-y-6 bg-slate-50/60 p-5 rounded-3xl border border-slate-200/80">
            

            {/* 1.1 CURRENT MONTH PERFORMANCE SUMMARY (6 KPI CARDS) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {/* Total Orders */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Orders
                  </span>
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <ShoppingBag size={16} />
                  </div>
                </div>
                <div>
                  <span className="text-lg md:text-xl font-black text-slate-900 block">
                    {reportItem.orders ?? 0}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 mt-0.5 block">
                    Orders this month
                  </span>
                </div>
              </div>

              {/* Cash Collected */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Cash Collected
                  </span>
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Wallet size={16} />
                  </div>
                </div>
                <div>
                  <span className="text-lg md:text-xl font-black text-emerald-600 block">
                    {formatINR(reportItem.cash_collection)}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700/70 mt-0.5 block">
                    Cash received
                  </span>
                </div>
              </div>

              {/* Orders Pending */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Orders Pending
                  </span>
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <Clock3 size={16} />
                  </div>
                </div>
                <div>
                  <span className="text-lg md:text-xl font-black text-amber-600 block">
                    {formatINR(reportItem.orders_pending)}
                  </span>
                  <span className="text-[10px] font-bold text-amber-700/70 mt-0.5 block">
                    Uncollected balance
                  </span>
                </div>
              </div>

              {/* Cancelled Orders */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Cancelled Orders
                  </span>
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                    <Ban size={16} />
                  </div>
                </div>
                <div>
                  <span className="text-lg md:text-xl font-black text-rose-600 block">
                    {reportItem.orders_cancelled ?? 0}
                  </span>
                  <span className="text-[10px] font-bold text-rose-700/70 mt-0.5 block">
                    {formatINR(reportItem.cancelled_orders_amount)}
                  </span>
                </div>
              </div>

              {/* Monthly Expenses */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Monthly Expenses
                  </span>
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                    <Receipt size={16} />
                  </div>
                </div>
                <div>
                  <span className="text-lg md:text-xl font-black text-rose-600 block">
                    {formatINR(reportItem.expense_amount)}
                  </span>
                  <span className="text-[10px] font-bold text-rose-700/70 mt-0.5 block">
                    Count: {reportItem.expenses_count ?? 0}
                  </span>
                </div>
              </div>

              {/* Monthly Net */}
              <div
                className={`border rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-2 ${
                  (reportItem.net_amount ?? 0) < 0
                    ? "bg-rose-500 text-white border-rose-600"
                    : "bg-slate-900 text-white border-slate-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    Monthly Net
                  </span>
                  <div className="p-2 bg-white/10 rounded-xl text-white">
                    <ArrowUpDown size={16} />
                  </div>
                </div>
                <div>
                  <span className="text-lg md:text-xl font-black block">
                    {formatINR(reportItem.net_amount)}
                  </span>
                  <span className="text-[10px] font-medium opacity-80 mt-0.5 block">
                    Collection − Expenses
                  </span>
                </div>
              </div>
            </div>

            {/* 1.2 SIDE-BY-SIDE ROW: SALES CATEGORIES (ROUND GRAPH) & ACCOUNTS BREAKDOWN (MAX 4 + VIEW ALL) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT: SALES CATEGORY BREAKDOWN (ROUND GRAPH / DONUT CHART) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Sales Category Breakdown
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {monthSalesCategoryBreakdown.length} Categories
                  </span>
                </div>

                {donutItems.length > 0 ? (
                  <div className="flex flex-col sm:flex-row items-center gap-5 py-2">
                    {/* SVG Donut Ring */}
                    <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          fill="transparent"
                          stroke="#f1f5f9"
                          strokeWidth="12"
                        />
                        {donutItems.map((item, idx) => (
                          <circle
                            key={item.category_id || idx}
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke={item.color}
                            strokeWidth="12"
                            strokeDasharray={`${item.dashLength} ${238.76 - item.dashLength}`}
                            strokeDashoffset={-item.dashOffset}
                            className="transition-all duration-500"
                          />
                        ))}
                      </svg>

                      {/* Center Text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 pointer-events-none">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          Total Sales
                        </span>
                        <span className="text-xs font-black text-slate-900 leading-tight">
                          {formatINR(totalCategoryCollection)}
                        </span>
                      </div>
                    </div>

                    {/* Donut Legend */}
                    <div className="flex-1 space-y-2.5 w-full">
                      {donutItems.map((item, idx) => (
                        <div
                          key={item.category_id || idx}
                          className="p-3 bg-slate-50/70 rounded-xl border border-slate-150 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="text-xs font-black text-slate-900">
                                {item.category_name}
                              </span>
                            </div>
                            <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md border ${item.pillClass}`}>
                              {item.pctInteger}%
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-1 text-[10px] pt-1 border-t border-slate-100 font-medium">
                            <div>
                              <span className="text-slate-400 block uppercase">Orders</span>
                              <strong className="text-slate-800 font-bold">{item.orders ?? 0}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block uppercase">Collected</span>
                              <strong className="text-emerald-600 font-bold">{formatINR(item.cash_collection)}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block uppercase">Pending</span>
                              <strong className="text-amber-600 font-bold">{formatINR(item.orders_pending)}</strong>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-slate-100">
                    No sales category data available for this month.
                  </div>
                )}
              </div>

              {/* RIGHT: ACCOUNT BREAKDOWN (MAX 4 ACCOUNTS + VIEW ALL) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-slate-700" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Account Breakdown
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {monthAccountBreakdown.length} Accounts
                    </span>
                    <Link
                      href="/accounts/accounts"
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-150 transition-colors"
                    >
                      <span>View All</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>

                {monthAccountBreakdown.length > 0 ? (
                  <div className="space-y-3">
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-2.5">Account Name</th>
                            <th className="px-4 py-2.5 text-right">Collected</th>
                            <th className="px-4 py-2.5 text-right">Spent</th>
                            <th className="px-4 py-2.5 text-right">Net</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white font-semibold">
                          {monthAccountBreakdown.slice(0, 4).map((acc, idx) => {
                            const netIsNeg = (acc.net_amount || 0) < 0;
                            return (
                              <tr key={acc.account_id || idx} className="hover:bg-slate-50/60 transition-colors">
                                <td className="px-4 py-2.5 font-bold text-slate-800 flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
                                  <span>{acc.account_name}</span>
                                </td>
                                <td className="px-4 py-2.5 text-right font-bold text-emerald-600">
                                  {formatINR(acc.cash_collection)}
                                </td>
                                <td className="px-4 py-2.5 text-right font-bold text-rose-600">
                                  {formatINR(acc.expense_amount)}
                                </td>
                                <td
                                  className={`px-4 py-2.5 text-right font-black ${
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

                    {monthAccountBreakdown.length > 4 && (
                      <div className="flex items-center justify-between text-xs pt-1 px-1">
                        <span className="text-[11px] text-slate-400 font-medium">
                          Showing 4 of {monthAccountBreakdown.length} accounts
                        </span>
                        <Link
                          href="/accounts/accounts"
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                        >
                          <span>View all {monthAccountBreakdown.length} accounts</span>
                          <span>→</span>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-slate-100">
                    No account breakdown data for this month.
                  </div>
                )}
              </div>
            </div>

            {/* 1.4 SIDE-BY-SIDE ROW: EXPENSE CATEGORY DATA & COMPLIANCE REMINDERS (MAX 4 DATA EACH + VIEW ALL) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT: EXPENSE CATEGORY DATA (MAX 4 + VIEW ALL) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-rose-600" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Expense Category Data
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md">
                      {monthExpenseCategoryBreakdown.length} Categories
                    </span>
                    <Link
                      href="/accounts/expense-report"
                      className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline inline-flex items-center gap-1 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-150 transition-colors"
                    >
                      <span>View All</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>

                {monthExpenseCategoryBreakdown.length > 0 ? (
                  <div className="space-y-3">
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-2.5">Category Name</th>
                            <th className="px-4 py-2.5 text-right">Count</th>
                            <th className="px-4 py-2.5 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white font-medium">
                          {monthExpenseCategoryBreakdown.slice(0, 4).map((cat, idx) => (
                            <tr key={cat.category_id || idx} className="hover:bg-slate-50/60 transition-colors">
                              <td className="px-4 py-2.5 font-bold text-slate-800">
                                {cat.category_name}
                              </td>
                              <td className="px-4 py-2.5 text-right font-medium text-slate-600">
                                {cat.expenses_count ?? 1}
                              </td>
                              <td className="px-4 py-2.5 text-right font-black text-rose-600">
                                {formatINR(cat.expense_amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {monthExpenseCategoryBreakdown.length > 4 && (
                      <div className="flex items-center justify-between text-xs pt-1 px-1">
                        <span className="text-[11px] text-slate-400 font-medium">
                          Showing 4 of {monthExpenseCategoryBreakdown.length} categories
                        </span>
                        <Link
                          href="/accounts/expense-report"
                          className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1"
                        >
                          <span>View all {monthExpenseCategoryBreakdown.length} categories</span>
                          <span>→</span>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-slate-100">
                    No expense category breakdown data for this month.
                  </div>
                )}
              </div>

              {/* RIGHT: COMPLIANCE REMINDERS (MAX 4 + VIEW ALL) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Compliance Reminders
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md border border-indigo-100">
                      {compliances.length} Deadlines
                    </span>
                    <Link
                      href="/accounts/compliances"
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-150 transition-colors"
                    >
                      <span>View All</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>

                {compliancesLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-pulse">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-20 bg-slate-100 rounded-xl" />
                    ))}
                  </div>
                ) : compliances.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-slate-100">
                    No upcoming compliance reminders found.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {compliances.slice(0, 4).map((comp) => {
                        const urgency = getReminderUrgency(comp);
                        return (
                          <div
                            key={comp.id}
                            className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all space-y-2 group shadow-2xs flex flex-col justify-between"
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-900 text-xs block group-hover:text-indigo-600 transition-colors line-clamp-1">
                                  {comp.compliance_name}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                                  {comp.compliance_type}
                                </span>
                              </div>
                              <span
                                className={`px-1.5 py-0.5 text-[9px] rounded-full border flex items-center gap-1 shrink-0 ${urgency.badgeClass}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${urgency.dotClass}`} />
                                {urgency.label}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-100 font-medium">
                              <div className="flex items-center gap-1">
                                <Bell className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>Remind: {formatDateReadable(comp.reminder_date || comp.due_date)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {compliances.length > 4 && (
                      <div className="flex items-center justify-between text-xs pt-1 px-1">
                        <span className="text-[11px] text-slate-400 font-medium">
                          Showing 4 of {compliances.length} reminders
                        </span>
                        <Link
                          href="/accounts/compliances"
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                        >
                          <span>View all {compliances.length} reminders</span>
                          <span>→</span>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
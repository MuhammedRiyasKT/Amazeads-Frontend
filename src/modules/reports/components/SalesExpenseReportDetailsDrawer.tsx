// src/modules/reports/components/SalesExpenseReportDetailsDrawer.tsx

"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Calendar,
  ShoppingBag,
  TrendingUp,
  Wallet,
  Clock,
  Ban,
  Receipt,
  Landmark,
  Layers,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  UserCheck,
} from "lucide-react";
import { SalesExpenseReportItem, StaffReport } from "../types/reports.types";
import { reportsService } from "../services/reports.service";

interface SalesExpenseReportDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  report: SalesExpenseReportItem | null;
  periodType?: "day" | "week" | "month" | "year";
}

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

export default function SalesExpenseReportDetailsDrawer({
  isOpen,
  onClose,
  report,
  periodType,
}: SalesExpenseReportDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<"period" | "cumulative" | "staff">("period");

  // Staff-wise report states
  const [staffReports, setStaffReports] = useState<StaffReport[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState<boolean>(false);
  const [staffError, setStaffError] = useState<string | null>(null);
  const [expandedStaffIds, setExpandedStaffIds] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      setActiveTab("period");
      setStaffReports([]);
      setStaffError(null);
      setExpandedStaffIds({});
    }
  }, [isOpen, report]);

  const loadStaffWiseReport = useCallback(async () => {
    if (!report) return;

    try {
      setIsLoadingStaff(true);
      setStaffError(null);

      // Infer periodType if not provided
      let effectivePeriod: string = periodType || "day";

      if (!periodType) {
        if (report.date && /^\d{4}$/.test(report.date.trim())) {
          effectivePeriod = "year";
        } else if (report.date && /^\d{4}-\d{2}$/.test(report.date.trim())) {
          effectivePeriod = "month";
        } else if (report.from_date && report.to_date && report.from_date !== report.to_date) {
          const from = new Date(report.from_date);
          const to = new Date(report.to_date);
          const diffDays = Math.round((to.getTime() - from.getTime()) / (1000 * 3600 * 24));
          if (diffDays > 300) {
            effectivePeriod = "year";
          } else if (diffDays >= 25 && diffDays <= 32) {
            effectivePeriod = "month";
          } else {
            effectivePeriod = "week";
          }
        }
      }

      const params: any = {
        periodType: effectivePeriod,
        page: 1,
        page_size: 50,
      };

      if (report.date) params.date = report.date;
      if (report.from_date) params.from_date = report.from_date;
      if (report.to_date) params.to_date = report.to_date;

      const dateToParse = report.from_date || report.date || "";
      if (dateToParse) {
        const parts = dateToParse.split("-");
        if (parts.length >= 1 && parts[0].length === 4) {
          params.year = parts[0];
        }
        if (parts.length >= 2) {
          params.month = parts[1];
        }
      }

      if (!params.year && report.name && /^\d{4}$/.test(report.name.trim())) {
        params.year = report.name.trim();
      }

      const res = await reportsService.getStaffWiseReport(params);

      if (res && res.data) {
        let reportsList: StaffReport[] = [];

        if (res.data.items && Array.isArray(res.data.items)) {
          const map = new Map<number, StaffReport>();
          res.data.items.forEach((it: any) => {
            if (it.staff_reports && Array.isArray(it.staff_reports)) {
              it.staff_reports.forEach((sr: StaffReport) => {
                if (!map.has(sr.staff_id)) {
                  map.set(sr.staff_id, { ...sr });
                } else {
                  const existing = map.get(sr.staff_id)!;
                  existing.orders += sr.orders || 0;
                  existing.sales_amount += sr.sales_amount || 0;
                  existing.cash_collection += sr.cash_collection || 0;
                  existing.orders_collection += sr.orders_collection || 0;
                  existing.orders_pending += sr.orders_pending || 0;
                  existing.orders_cancelled += sr.orders_cancelled || 0;
                  existing.cancelled_orders_amount += sr.cancelled_orders_amount || 0;
                }
              });
            } else if (it.staff_id || it.staff_name) {
              const staffId = it.staff_id || it.id;
              if (!map.has(staffId)) {
                map.set(staffId, { ...it, staff_id: staffId });
              } else {
                const existing = map.get(staffId)!;
                existing.orders += it.orders || 0;
                existing.sales_amount += it.sales_amount || 0;
                existing.cash_collection += it.cash_collection || 0;
                existing.orders_collection += it.orders_collection || 0;
                existing.orders_pending += it.orders_pending || 0;
                existing.orders_cancelled += it.orders_cancelled || 0;
                existing.cancelled_orders_amount += it.cancelled_orders_amount || 0;
              }
            }
          });
          reportsList = Array.from(map.values());
        } else if (res.data.staff_reports && Array.isArray(res.data.staff_reports)) {
          reportsList = res.data.staff_reports;
        } else if (Array.isArray(res.data)) {
          reportsList = res.data;
        }

        setStaffReports(reportsList);
      } else {
        setStaffReports([]);
      }
    } catch (err: any) {
      console.error("Failed to load staff-wise report:", err);
      setStaffError("Unable to load staff report data. Please check network connection.");
    } finally {
      setIsLoadingStaff(false);
    }
  }, [report, periodType]);

  useEffect(() => {
    if (activeTab === "staff" && staffReports.length === 0 && !isLoadingStaff && !staffError) {
      loadStaffWiseReport();
    }
  }, [activeTab, staffReports.length, isLoadingStaff, staffError, loadStaffWiseReport]);

  const toggleExpandStaff = (staffId: number) => {
    setExpandedStaffIds((prev) => ({
      ...prev,
      [staffId]: !prev[staffId],
    }));
  };

  if (!isOpen || !report) return null;

  const netIsNeg = report.net_amount < 0;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[2000] flex justify-end transition-opacity animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative bg-white w-full max-w-2xl h-full border-l border-slate-200 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">
                  {report.name || "Report Details"}
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {report.status || "generated"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Detailed sales, expense, and account breakdown
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Segmented Slider Tab Toggle */}
        <div className="flex items-center px-6 py-2 border-b border-slate-200 bg-slate-50/50 gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab("period")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "period"
                ? "bg-white text-indigo-700 shadow-2xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            Selected Period Data
          </button>

          <button
            onClick={() => setActiveTab("cumulative")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "cumulative"
                ? "bg-white text-indigo-700 shadow-2xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            <span>Overall / Cumulative</span>
            <span className="px-1.5 py-0.2 text-[9px] bg-slate-200/80 text-slate-700 rounded-full font-extrabold">
              Totals
            </span>
          </button>

          <button
            onClick={() => setActiveTab("staff")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "staff"
                ? "bg-indigo-600 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            <Users size={13} />
            <span>Staff Wise Performance</span>
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {activeTab === "period" && (
            <>
              {/* 1. REPORT PERIOD */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Report Period</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/70">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">From Date</span>
                    <span className="font-bold text-slate-900">{formatDateReadable(report.from_date || report.date)}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/70">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">To Date</span>
                    <span className="font-bold text-slate-900">{formatDateReadable(report.to_date || report.date)}</span>
                  </div>
                </div>
              </div>

              {/* 2. SALES SUMMARY */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span>Sales Summary</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white border border-slate-200 rounded-xl p-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Orders</span>
                    <strong className="text-sm font-black text-slate-900">{report.orders ?? 0}</strong>
                  </div>

                  <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-3">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase block">Sales Amount</span>
                    <strong className="text-sm font-black text-indigo-900">{formatINR(report.sales_amount)}</strong>
                  </div>

                  <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-3">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase block">Cash Collection</span>
                    <strong className="text-sm font-black text-emerald-900">{formatINR(report.cash_collection)}</strong>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Orders Collection</span>
                    <strong className="text-sm font-bold text-slate-800">{formatINR(report.orders_collection)}</strong>
                  </div>

                  <div className="bg-amber-50/40 border border-amber-100 rounded-xl p-3">
                    <span className="text-[10px] font-bold text-amber-600 uppercase block">Pending</span>
                    <strong className="text-sm font-black text-amber-900">{formatINR(report.orders_pending)}</strong>
                  </div>

                  <div className="bg-rose-50/40 border border-rose-100 rounded-xl p-3">
                    <span className="text-[10px] font-bold text-rose-600 uppercase block">Cancelled Orders</span>
                    <strong className="text-sm font-black text-rose-900">
                      {report.orders_cancelled ?? 0} ({formatINR(report.cancelled_orders_amount)})
                    </strong>
                  </div>
                </div>
              </div>

              {/* 3. EXPENSE SUMMARY */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                  <Receipt className="w-4 h-4 text-rose-600" />
                  <span>Expense Summary</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white border border-slate-200 rounded-xl p-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Expense Count</span>
                    <strong className="text-sm font-black text-slate-900">{report.expenses_count ?? 0}</strong>
                  </div>

                  <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-3">
                    <span className="text-[10px] font-bold text-rose-600 uppercase block">Expense Amount</span>
                    <strong className="text-sm font-black text-rose-900">{formatINR(report.expense_amount)}</strong>
                  </div>
                </div>
              </div>

              {/* 4. NET AMOUNT HERO CARD */}
              <div
                className={`border rounded-xl p-4 flex items-center justify-between shadow-xs ${
                  netIsNeg
                    ? "bg-rose-500 text-white border-rose-600"
                    : "bg-slate-900 text-white border-slate-900"
                }`}
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    Net Amount (Period)
                  </span>
                  <p className="text-xs text-slate-300">Sales Collection − Expense Amount</p>
                </div>
                <strong className="text-2xl font-black">{formatINR(report.net_amount)}</strong>
              </div>

              {/* 5. SALES CATEGORY BREAKDOWN */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span>Sales Category Breakdown</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {report.sales_category_breakdown?.length || 0} categories
                  </span>
                </div>

                {report.sales_category_breakdown && report.sales_category_breakdown.length > 0 ? (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2.5">Category</th>
                          <th className="px-3 py-2.5 text-right">Orders</th>
                          <th className="px-3 py-2.5 text-right">Sales Amount</th>
                          <th className="px-3 py-2.5 text-right">Collection</th>
                          <th className="px-3 py-2.5 text-right">Pending</th>
                          <th className="px-3 py-2.5 text-right">Cancelled</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {report.sales_category_breakdown.map((cat, idx) => (
                          <tr key={cat.category_id || idx} className="hover:bg-slate-50/50">
                            <td className="px-3 py-2.5 font-bold text-slate-800">
                              {cat.category_name}
                            </td>
                            <td className="px-3 py-2.5 text-right font-medium text-slate-600">
                              {cat.orders ?? cat.total_orders ?? 0}
                            </td>
                            <td className="px-3 py-2.5 text-right font-bold text-slate-900">
                              {formatINR(cat.sales_amount ?? cat.total_sales_amount)}
                            </td>
                            <td className="px-3 py-2.5 text-right font-bold text-emerald-600">
                              {formatINR(cat.cash_collection ?? cat.orders_collection ?? cat.total_cash_collection)}
                            </td>
                            <td className="px-3 py-2.5 text-right font-semibold text-amber-600">
                              {formatINR(cat.orders_pending ?? cat.total_cash_pending)}
                            </td>
                            <td className="px-3 py-2.5 text-right font-semibold text-rose-600">
                              {cat.orders_cancelled ?? cat.total_orders_cancelled ?? 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    No sales category breakdown for this period.
                  </p>
                )}
              </div>

              {/* 6. EXPENSE CATEGORY BREAKDOWN */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <Receipt className="w-4 h-4 text-rose-600" />
                    <span>Expense Category Breakdown</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {report.expense_category_breakdown?.length || 0} categories
                  </span>
                </div>

                {report.expense_category_breakdown && report.expense_category_breakdown.length > 0 ? (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2.5">Category</th>
                          <th className="px-3 py-2.5 text-right">Expense Count</th>
                          <th className="px-3 py-2.5 text-right">Expense Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {report.expense_category_breakdown.map((cat, idx) => (
                          <tr key={cat.category_id || idx} className="hover:bg-slate-50/50">
                            <td className="px-3 py-2.5 font-bold text-slate-800">
                              {cat.category_name}
                            </td>
                            <td className="px-3 py-2.5 text-right font-medium text-slate-600">
                              {cat.expense_count ?? cat.expenses_count ?? cat.total_expenses_count ?? 0}
                            </td>
                            <td className="px-3 py-2.5 text-right font-bold text-rose-600">
                              {formatINR(cat.expense_amount ?? cat.total_expense_amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    No expense category breakdown for this period.
                  </p>
                )}
              </div>

              {/* 7. ACCOUNT BREAKDOWN */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <Landmark className="w-4 h-4 text-slate-700" />
                    <span>Account Breakdown</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {report.account_breakdown?.length || 0} accounts
                  </span>
                </div>

                {report.account_breakdown && report.account_breakdown.length > 0 ? (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2.5">Account</th>
                          <th className="px-3 py-2.5 text-right">Cash Collection</th>
                          <th className="px-3 py-2.5 text-right">Expense</th>
                          <th className="px-3 py-2.5 text-right">Net</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {report.account_breakdown.map((acc, idx) => (
                          <tr key={acc.account_id || idx} className="hover:bg-slate-50/50">
                            <td className="px-3 py-2.5 font-bold text-slate-800">
                              {acc.account_name}
                            </td>
                            <td className="px-3 py-2.5 text-right font-bold text-emerald-600">
                              {formatINR(acc.cash_collection)}
                            </td>
                            <td className="px-3 py-2.5 text-right font-bold text-rose-600">
                              {formatINR(acc.expense_amount)}
                            </td>
                            <td
                              className={`px-3 py-2.5 text-right font-black ${
                                acc.net_amount < 0 ? "text-rose-600" : "text-slate-900"
                              }`}
                            >
                              {formatINR(acc.net_amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    No account breakdown available.
                  </p>
                )}
              </div>
            </>
          )}

          {activeTab === "cumulative" && (
            /* CUMULATIVE / OVERALL VIEW */
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block">Overall / Cumulative Totals Notice</strong>
                  <p className="text-amber-800 text-[11px] mt-0.5">
                    These metrics represent cumulative grand totals across the system, not restricted to the selected period.
                  </p>
                </div>
              </div>

              {/* Cumulative KPI cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white border border-slate-200 rounded-xl p-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Orders</span>
                  <strong className="text-sm font-black text-slate-900">{report.total_orders ?? 0}</strong>
                </div>

                <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-3">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase block">Total Sales Amount</span>
                  <strong className="text-sm font-black text-indigo-900">{formatINR(report.total_sales_amount)}</strong>
                </div>

                <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-3">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase block">Total Cash Collection</span>
                  <strong className="text-sm font-black text-emerald-900">{formatINR(report.total_cash_collection)}</strong>
                </div>

                <div className="bg-amber-50/40 border border-amber-100 rounded-xl p-3">
                  <span className="text-[10px] font-bold text-amber-600 uppercase block">Total Cash Pending</span>
                  <strong className="text-sm font-black text-amber-900">{formatINR(report.total_cash_pending)}</strong>
                </div>

                <div className="bg-rose-50/40 border border-rose-100 rounded-xl p-3">
                  <span className="text-[10px] font-bold text-rose-600 uppercase block">Total Expense Amount</span>
                  <strong className="text-sm font-black text-rose-900">{formatINR(report.total_expense_amount)}</strong>
                </div>

                <div className="bg-slate-900 text-white border border-slate-900 rounded-xl p-3">
                  <span className="text-[10px] font-bold text-slate-300 uppercase block">Total Net Amount</span>
                  <strong className="text-sm font-black">{formatINR(report.total_net_amount)}</strong>
                </div>
              </div>

              {/* Cumulative Sales Category Breakdown */}
              {report.total_sales_category_breakdown && report.total_sales_category_breakdown.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-1">
                    Cumulative Sales Category Breakdown
                  </h4>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2.5">Category</th>
                          <th className="px-3 py-2.5 text-right">Total Orders</th>
                          <th className="px-3 py-2.5 text-right">Total Sales</th>
                          <th className="px-3 py-2.5 text-right">Total Collection</th>
                          <th className="px-3 py-2.5 text-right">Total Pending</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {report.total_sales_category_breakdown.map((cat, idx) => (
                          <tr key={cat.category_id || idx}>
                            <td className="px-3 py-2.5 font-bold text-slate-800">{cat.category_name}</td>
                            <td className="px-3 py-2.5 text-right font-medium text-slate-600">{cat.total_orders ?? 0}</td>
                            <td className="px-3 py-2.5 text-right font-bold text-slate-900">{formatINR(cat.total_sales_amount)}</td>
                            <td className="px-3 py-2.5 text-right font-bold text-emerald-600">{formatINR(cat.total_cash_collection)}</td>
                            <td className="px-3 py-2.5 text-right font-semibold text-amber-600">{formatINR(cat.total_cash_pending)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Cumulative Expense Category Breakdown */}
              {report.total_expense_category_breakdown && report.total_expense_category_breakdown.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-1">
                    Cumulative Expense Category Breakdown
                  </h4>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2.5">Category</th>
                          <th className="px-3 py-2.5 text-right">Expenses Count</th>
                          <th className="px-3 py-2.5 text-right">Expense Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {report.total_expense_category_breakdown.map((cat, idx) => (
                          <tr key={cat.category_id || idx}>
                            <td className="px-3 py-2.5 font-bold text-slate-800">{cat.category_name}</td>
                            <td className="px-3 py-2.5 text-right font-medium text-slate-600">{cat.expense_count ?? cat.total_expenses_count ?? cat.expenses_count ?? 0}</td>
                            <td className="px-3 py-2.5 text-right font-bold text-rose-600">{formatINR(cat.total_expense_amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "staff" && (
            /* STAFF-WISE PERFORMANCE VIEW */
            <div className="space-y-5">
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Staff Performance Breakdown
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Individual staff member sales, collection, pending &amp; order contributions
                    </p>
                  </div>
                </div>

                <button
                  onClick={loadStaffWiseReport}
                  disabled={isLoadingStaff}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs self-end sm:self-auto"
                >
                  <RefreshCw size={13} className={isLoadingStaff ? "animate-spin" : ""} />
                  <span>Refresh</span>
                </button>
              </div>

              {isLoadingStaff ? (
                /* LOADING STATE */
                <div className="p-8 space-y-4">
                  <div className="h-6 bg-slate-100 rounded-lg w-1/3 animate-pulse"></div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((idx) => (
                      <div key={idx} className="h-20 bg-slate-100/70 rounded-2xl animate-pulse"></div>
                    ))}
                  </div>
                </div>
              ) : staffError ? (
                /* ERROR STATE */
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{staffError}</span>
                  </div>
                  <button
                    onClick={loadStaffWiseReport}
                    className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-xl text-xs"
                  >
                    Retry
                  </button>
                </div>
              ) : staffReports.length === 0 ? (
                /* EMPTY STATE */
                <div className="p-10 text-center space-y-2 bg-slate-50 border border-slate-200 rounded-2xl">
                  <Users className="w-8 h-8 text-slate-300 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-800">No Staff Performance Records</h4>
                  <p className="text-[11px] text-slate-500">
                    No staff sales activities were logged for this selected period.
                  </p>
                </div>
              ) : (
                /* STAFF LIST CARDS */
                <div className="space-y-3.5">
                  {staffReports.map((st) => {
                    const isExpanded = Boolean(expandedStaffIds[st.staff_id]);
                    const hasCategories =
                      st.sales_category_breakdown && st.sales_category_breakdown.length > 0;

                    return (
                      <div
                        key={st.staff_id}
                        className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs hover:border-slate-300 transition-all"
                      >
                        {/* Staff Card Header */}
                        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                              {st.staff_name ? st.staff_name.slice(0, 2).toUpperCase() : "ST"}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                                  {st.staff_name}
                                </h4>
                                <span className="px-2 py-0.2 text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200 rounded-md">
                                  ID: #{st.staff_id}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                                Orders: {st.orders ?? 0} {st.orders_cancelled ? `(${st.orders_cancelled} Cancelled)` : ""}
                              </span>
                            </div>
                          </div>

                          {/* Quick Totals */}
                          <div className="flex items-center gap-3 text-right">
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 uppercase block">Sales</span>
                              <span className="text-xs font-black text-slate-900">{formatINR(st.sales_amount)}</span>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-emerald-600 uppercase block">Collection</span>
                              <span className="text-xs font-black text-emerald-600">{formatINR(st.cash_collection)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="p-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-white">
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <span className="text-[9px] font-bold text-slate-400 uppercase block">Orders</span>
                            <span className="font-extrabold text-slate-800">{st.orders ?? 0}</span>
                          </div>

                          <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/60">
                            <span className="text-[9px] font-bold text-emerald-600 uppercase block">Collected</span>
                            <span className="font-black text-emerald-700">{formatINR(st.cash_collection)}</span>
                          </div>

                          <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/60">
                            <span className="text-[9px] font-bold text-amber-600 uppercase block">Pending</span>
                            <span className="font-black text-amber-700">{formatINR(st.orders_pending)}</span>
                          </div>

                          <div className="bg-rose-50/50 p-2.5 rounded-xl border border-rose-100/60">
                            <span className="text-[9px] font-bold text-rose-600 uppercase block">Cancelled</span>
                            <span className="font-black text-rose-700">
                              {st.orders_cancelled ?? 0} ({formatINR(st.cancelled_orders_amount)})
                            </span>
                          </div>
                        </div>



                        {/* Category Breakdown Expand Toggle */}
                        {hasCategories && (
                          <div className="border-t border-slate-100 bg-slate-50/30">
                            <button
                              onClick={() => toggleExpandStaff(st.staff_id)}
                              className="w-full px-4 py-2 text-[11px] font-extrabold text-indigo-700 hover:text-indigo-900 flex items-center justify-between transition-colors cursor-pointer"
                            >
                              <span className="flex items-center gap-1.5">
                                <Layers size={13} />
                                <span>Sales Category Breakdown ({st.sales_category_breakdown?.length ?? 0})</span>
                              </span>
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>

                            {isExpanded && (
                              <div className="px-4 pb-4 pt-1 animate-in fade-in duration-200">
                                <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                                  <table className="w-full text-left text-xs whitespace-nowrap">
                                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] border-b border-slate-200">
                                      <tr>
                                        <th className="px-3 py-2">Category</th>
                                        <th className="px-3 py-2 text-right">Orders</th>
                                        <th className="px-3 py-2 text-right">Sales Amount</th>
                                        <th className="px-3 py-2 text-right">Collection</th>
                                        <th className="px-3 py-2 text-right">Pending</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {st.sales_category_breakdown?.map((cat, idx) => (
                                        <tr key={cat.category_id || idx} className="hover:bg-slate-50/50">
                                          <td className="px-3 py-2 font-bold text-slate-800">
                                            {cat.category_name}
                                          </td>
                                          <td className="px-3 py-2 text-right font-medium text-slate-600">
                                            {cat.orders ?? 0}
                                          </td>
                                          <td className="px-3 py-2 text-right font-bold text-slate-900">
                                            {formatINR(cat.sales_amount)}
                                          </td>
                                          <td className="px-3 py-2 text-right font-bold text-emerald-600">
                                            {formatINR(cat.cash_collection)}
                                          </td>
                                          <td className="px-3 py-2 text-right font-semibold text-amber-600">
                                            {formatINR(cat.orders_pending)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
}

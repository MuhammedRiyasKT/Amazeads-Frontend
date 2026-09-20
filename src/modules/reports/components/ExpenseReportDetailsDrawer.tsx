// src/modules/reports/components/ExpenseReportDetailsDrawer.tsx

"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Calendar,
  Receipt,
  Clock,
  Landmark,
  Layers,
  AlertCircle,
  Hash,
  FileText,
  User,
  Paperclip,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
} from "lucide-react";
import { ExpenseReportItem } from "../types/reports.types";
import { reportsService } from "../services/reports.service";

interface ExpenseReportDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  report: ExpenseReportItem | null;
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

export default function ExpenseReportDetailsDrawer({
  isOpen,
  onClose,
  report,
}: ExpenseReportDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<"period" | "cumulative" | "detailed">("period");

  // Category filter state for Detailed tab
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);

  // State for Detailed Expenses List
  const [detailedExpenses, setDetailedExpenses] = useState<any[]>([]);
  const [isLoadingDetailed, setIsLoadingDetailed] = useState<boolean>(false);
  const [detailedError, setDetailedError] = useState<string | null>(null);
  const [detailedPage, setDetailedPage] = useState<number>(1);
  const [detailedTotalCount, setDetailedTotalCount] = useState<number>(0);
  const [detailedTotalPages, setDetailedTotalPages] = useState<number>(1);

  // Calculate Total Amount of loaded detailed transactions
  const detailedTotalAmount = useMemo(() => {
    if (!detailedExpenses || detailedExpenses.length === 0) return 0;
    return detailedExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [detailedExpenses]);

  // Reset tab & category filter when opening drawer or report changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab("period");
      setSelectedCategoryId(null);
      setSelectedCategoryName(null);
    }
  }, [isOpen, report]);

  // Handler to view specific category transactions in Detailed tab
  const handleViewCategoryDetails = (cat: any) => {
    const catId = cat.category_id || cat.id;
    if (catId) {
      setSelectedCategoryId(catId);
      setSelectedCategoryName(cat.category_name || `Category #${catId}`);
      setDetailedPage(1);
      setActiveTab("detailed");
    }
  };

  // Fetch Detailed Expenses when switching to "detailed" tab or page / category changes
  useEffect(() => {
    if (isOpen && report && activeTab === "detailed") {
      setIsLoadingDetailed(true);
      setDetailedError(null);

      const fromDate = report.from_date || report.date;
      const toDate = report.to_date || report.date;

      const params: any = {
        page: detailedPage,
        page_size: 10,
      };

      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      if (!fromDate && !toDate && report.date) params.date = report.date;

      if (selectedCategoryId) {
        params.expense_category_id = selectedCategoryId;
      }

      reportsService
        .getDetailedExpenses(params)
        .then((res: any) => {
          const items = res?.items || (Array.isArray(res) ? res : []);
          setDetailedExpenses(items);

          if (res?.pagination) {
            setDetailedTotalCount(res.pagination.total_count || items.length);
            setDetailedTotalPages(res.pagination.total_pages || 1);
          } else {
            const total = res?.total ?? items.length;
            setDetailedTotalCount(total);
            setDetailedTotalPages((res?.total_pages ?? Math.ceil(total / 10)) || 1);
          }
        })
        .catch((err: any) => {
          console.error("Failed to load detailed expense items:", err);
          setDetailedError("Unable to load detailed expenses.");
          setDetailedExpenses([]);
        })
        .finally(() => setIsLoadingDetailed(false));
    }
  }, [isOpen, report, activeTab, detailedPage, selectedCategoryId]);

  if (!isOpen || !report) return null;

  // Extract period category breakdown (handles DAY/WEEK vs MONTH/YEAR)
  const categoryList = report.category_breakdown || report.expense_category_breakdown || [];
  // Extract cumulative category breakdown
  const cumulativeCategoryList = report.total_category_breakdown || report.total_expense_category_breakdown || [];

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[2000] flex justify-end transition-opacity animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative bg-white w-full max-w-3xl h-full border-l border-slate-200 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">
                  {report.name || "Expense Report Details"}
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {report.status || "generated"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Period expense totals, category breakdown &amp; detailed transactions
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

        {/* Tab Toggle Bar */}
        <div className="flex items-center px-6 pt-3 pb-0 border-b border-slate-200 bg-white gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("period")}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "period"
                ? "border-rose-600 text-rose-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Selected Period Data
          </button>

          {report.total_expense_amount !== undefined && (
            <button
              onClick={() => setActiveTab("cumulative")}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "cumulative"
                  ? "border-rose-600 text-rose-600"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              <span>Overall Expense Summary</span>
              <span className="px-1.5 py-0.2 text-[9px] bg-slate-100 text-slate-600 rounded-full">
                Cumulative
              </span>
            </button>
          )}

          <button
            onClick={() => {
              setActiveTab("detailed");
              setDetailedPage(1);
            }}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "detailed"
                ? "border-rose-600 text-rose-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText size={13} />
            <span>Detailed Transactions</span>
            <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 rounded-full">
              {detailedTotalCount > 0 ? detailedTotalCount : report.expenses_count || report.expenses_ids?.length || 0}
            </span>
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {activeTab === "period" ? (
            <>
              {/* 1. REPORT PERIOD INFORMATION */}
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

              {/* 2. EXPENSE SUMMARY */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                  <Receipt className="w-4 h-4 text-rose-600" />
                  <span>Expense Summary (Period)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-3">
                    <span className="text-[10px] font-bold text-rose-600 uppercase block">Expense Amount</span>
                    <strong className="text-base font-black text-rose-900">{formatINR(report.expense_amount)}</strong>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Number of Expenses</span>
                    <strong className="text-base font-black text-slate-900">{report.expenses_count ?? report.expense_count ?? 0}</strong>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-3 col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Average Expense</span>
                    <strong className="text-base font-bold text-slate-800">
                      {(report.expenses_count || report.expense_count) && (report.expenses_count || report.expense_count) > 0
                        ? formatINR(report.expense_amount / (report.expenses_count || report.expense_count))
                        : "₹0"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* 3. EXPENSE CATEGORIES BREAKDOWN */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <Layers className="w-4 h-4 text-rose-600" />
                    <span>Expense Categories</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {categoryList.length} categories
                  </span>
                </div>

                {categoryList.length > 0 ? (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2.5">Category Name</th>
                          <th className="px-3 py-2.5 text-right">Expense Count</th>
                          <th className="px-3 py-2.5 text-right">Amount</th>
                          <th className="px-3 py-2.5 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {categoryList.map((cat, idx) => (
                          <tr key={cat.category_id || idx} className="hover:bg-slate-50/50">
                            <td className="px-3 py-2.5 font-bold text-slate-800">
                              {cat.category_name}
                            </td>
                            <td className="px-3 py-2.5 text-right font-medium text-slate-600">
                              {cat.expense_count ?? cat.expenses_count ?? "—"}
                            </td>
                            <td className="px-3 py-2.5 text-right font-bold text-rose-600">
                              {formatINR(cat.expense_amount)}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <button
                                onClick={() => handleViewCategoryDetails(cat)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-2xs"
                                title="View Category Detailed Transactions"
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
                ) : (
                  <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    No expense category breakdown available for this period.
                  </p>
                )}
              </div>

              {/* 5. ACCOUNT-WISE EXPENSES */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <Landmark className="w-4 h-4 text-slate-700" />
                    <span>Account-wise Expenses</span>
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
                          <th className="px-3 py-2.5">Account Name</th>
                          <th className="px-3 py-2.5 text-right">Expense Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {report.account_breakdown.map((acc, idx) => (
                          <tr key={acc.account_id || idx} className="hover:bg-slate-50/50">
                            <td className="px-3 py-2.5 font-bold text-slate-800">
                              {acc.account_name}
                            </td>
                            <td className="px-3 py-2.5 text-right font-bold text-rose-600">
                              {formatINR(acc.expense_amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    No account breakdown available for this period.
                  </p>
                )}
              </div>
            </>
          ) : activeTab === "cumulative" ? (
            /* OVERALL / CUMULATIVE VIEW */
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block">Overall Expense Summary Notice</strong>
                  <p className="text-amber-800 text-[11px] mt-0.5">
                    These values represent cumulative expense grand totals across the entire ERP system, not restricted to the selected period.
                  </p>
                </div>
              </div>

              {/* Cumulative KPI cards */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-3.5">
                  <span className="text-[10px] font-bold text-rose-600 uppercase block">Overall Expense Amount</span>
                  <strong className="text-base font-black text-rose-900">{formatINR(report.total_expense_amount)}</strong>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-3.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Expenses Count</span>
                  <strong className="text-base font-black text-slate-900">{report.total_expenses_count ?? report.expenses_count ?? report.expense_count ?? 0}</strong>
                </div>
              </div>

              {/* Cumulative Category Breakdown */}
              {cumulativeCategoryList.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-1">
                    Cumulative Expense Category Breakdown
                  </h4>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2.5">Category Name</th>
                          <th className="px-3 py-2.5 text-right">Total Expenses Count</th>
                          <th className="px-3 py-2.5 text-right">Total Expense Amount</th>
                          <th className="px-3 py-2.5 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {cumulativeCategoryList.map((cat, idx) => (
                          <tr key={cat.category_id || idx} className="hover:bg-slate-50/50">
                            <td className="px-3 py-2.5 font-bold text-slate-800">{cat.category_name}</td>
                            <td className="px-3 py-2.5 text-right font-medium text-slate-600">
                              {cat.expense_count ?? cat.total_expenses_count ?? cat.expenses_count ?? "—"}
                            </td>
                            <td className="px-3 py-2.5 text-right font-bold text-rose-600">
                              {formatINR(cat.total_expense_amount ?? cat.expense_amount)}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <button
                                onClick={() => handleViewCategoryDetails(cat)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-2xs"
                                title="View Category Detailed Transactions"
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
                </div>
              )}

              {/* Cumulative Account Breakdown */}
              {report.total_account_breakdown && report.total_account_breakdown.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-1">
                    Cumulative Account Breakdown
                  </h4>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2.5">Account Name</th>
                          <th className="px-3 py-2.5 text-right">Total Expense Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {report.total_account_breakdown.map((acc, idx) => (
                          <tr key={acc.account_id || idx}>
                            <td className="px-3 py-2.5 font-bold text-slate-800">{acc.account_name}</td>
                            <td className="px-3 py-2.5 text-right font-bold text-rose-600">{formatINR(acc.expense_amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* DETAILED TRANSACTIONS VIEW */
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-rose-600" />
                  <span>Detailed Expense Transactions</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  {detailedTotalCount} total records
                </span>
              </div>

              {selectedCategoryId && (
                <div className="flex items-center justify-between bg-rose-50/90 border border-rose-200 rounded-xl px-3.5 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-rose-900">Filtered by Category:</span>
                    <span className="font-extrabold text-rose-700 bg-white border border-rose-200 px-2.5 py-0.5 rounded-lg shadow-2xs capitalize">
                      {selectedCategoryName || `Category #${selectedCategoryId}`}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategoryId(null);
                      setSelectedCategoryName(null);
                      setDetailedPage(1);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-extrabold text-rose-700 hover:text-rose-900 bg-white border border-rose-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer hover:bg-rose-100 shadow-2xs"
                  >
                    <X size={13} />
                    <span>Clear Filter</span>
                  </button>
                </div>
              )}

              {isLoadingDetailed ? (
                <div className="py-12 text-center text-xs font-semibold text-slate-500 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-rose-600" />
                  <span>Loading detailed expense transactions...</span>
                </div>
              ) : detailedError ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 text-center">
                  {detailedError}
                </div>
              ) : detailedExpenses.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-500">
                  No individual expense transactions found for this period.
                </div>
              ) : (
                <>
                  {/* COMPACT SUMMARY KPI CARDS */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-rose-50/70 border border-rose-100 rounded-xl p-3 shadow-2xs">
                      <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
                        {selectedCategoryId ? "Category Total Amount" : "Total Amount"}
                      </span>
                      <strong className="text-sm sm:text-base font-black text-rose-900 block mt-0.5">
                        {formatINR(detailedTotalAmount)}
                      </strong>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Total Transactions
                      </span>
                      <strong className="text-sm sm:text-base font-black text-slate-900 block mt-0.5">
                        {detailedTotalCount > 0 ? detailedTotalCount : detailedExpenses.length}
                      </strong>
                    </div>

                    <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 shadow-2xs col-span-2 sm:col-span-1">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                        Average Expense
                      </span>
                      <strong className="text-sm sm:text-base font-bold text-indigo-900 block mt-0.5">
                        {detailedExpenses.length > 0
                          ? formatINR(detailedTotalAmount / detailedExpenses.length)
                          : "₹0"}
                      </strong>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2.5">ID</th>
                          <th className="px-3 py-2.5">Category</th>
                          <th className="px-3 py-2.5">Date</th>
                          <th className="px-3 py-2.5 text-right">Amount</th>
                          <th className="px-3 py-2.5">Account / Payment</th>
                          <th className="px-3 py-2.5">Created By</th>
                          <th className="px-3 py-2.5">Description</th>
                          <th className="px-3 py-2.5 text-center">Attachment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {detailedExpenses.map((item: any, idx: number) => {
                          const hasAttachment =
                            item.attachment_url &&
                            item.attachment_url !== "nil" &&
                            item.attachment_url !== "null";

                          return (
                            <tr key={item.id || idx} className="hover:bg-slate-50/70 transition-colors">
                              <td className="px-3 py-2.5 font-bold text-slate-900">
                                #{item.id}
                              </td>
                              <td className="px-3 py-2.5 font-bold text-slate-800 capitalize">
                                {item.category_name || "—"}
                              </td>
                              <td className="px-3 py-2.5 text-slate-600 font-medium">
                                {formatDateReadable(item.expense_date || item.created_on)}
                              </td>
                              <td className="px-3 py-2.5 text-right font-black text-rose-600">
                                {formatINR(item.amount)}
                              </td>
                              <td className="px-3 py-2.5">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                  {item.payment_type || item.account_name || "Cash"}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 font-semibold text-slate-700 capitalize">
                                {item.created_by_name || "—"}
                              </td>
                              <td className="px-3 py-2.5 text-slate-500 max-w-[160px] truncate" title={item.description}>
                                {item.description && item.description !== "nil" ? item.description : "—"}
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                {hasAttachment ? (
                                  <a
                                    href={item.attachment_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-extrabold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md border border-indigo-200 transition-colors"
                                  >
                                    <Paperclip size={11} /> View
                                  </a>
                                ) : (
                                  <span className="text-slate-300 text-[10px]">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {detailedTotalPages > 1 && (
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs font-semibold text-slate-500">
                        Page <strong>{detailedPage}</strong> of <strong>{detailedTotalPages}</strong>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          disabled={detailedPage <= 1}
                          onClick={() => setDetailedPage((p) => Math.max(1, p - 1))}
                          className="px-2.5 py-1 text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <ChevronLeft size={14} /> Previous
                        </button>
                        <button
                          disabled={detailedPage >= detailedTotalPages}
                          onClick={() => setDetailedPage((p) => Math.min(detailedTotalPages, p + 1))}
                          className="px-2.5 py-1 text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        >
                          Next <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
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

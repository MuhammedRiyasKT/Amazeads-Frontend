// src/modules/reports/components/ExpenseReportDetailsDrawer.tsx

"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { ExpenseReportItem } from "../types/reports.types";

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
  const [activeTab, setActiveTab] = useState<"period" | "cumulative">("period");

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
      <div className="relative bg-white w-full max-w-2xl h-full border-l border-slate-200 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        
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
                Period expense totals, category &amp; account breakdown
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

        {/* Tab Toggle (Selected Period vs Cumulative) */}
        {report.total_expense_amount !== undefined && (
          <div className="flex items-center px-6 pt-3 pb-0 border-b border-slate-100 bg-white gap-2">
            <button
              onClick={() => setActiveTab("period")}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === "period"
                  ? "border-rose-600 text-rose-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Selected Period Data
            </button>
            <button
              onClick={() => setActiveTab("cumulative")}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
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
          </div>
        )}

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
                    <strong className="text-base font-black text-slate-900">{report.expenses_count ?? 0}</strong>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-3 col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Average Expense</span>
                    <strong className="text-base font-bold text-slate-800">
                      {report.expenses_count && report.expenses_count > 0
                        ? formatINR(report.expense_amount / report.expenses_count)
                        : "₹0"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* 3. EXPENSE IDs INCLUDED IN THIS PERIOD */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                  <Hash className="w-4 h-4 text-rose-600" />
                  <span>Expense IDs Included ({report.expenses_ids?.length || 0})</span>
                </div>

                {report.expenses_ids && report.expenses_ids.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                    {report.expenses_ids.map((id) => (
                      <span
                        key={id}
                        className="px-2.5 py-1 bg-white border border-slate-200 text-slate-800 font-bold text-xs rounded-lg shadow-2xs"
                      >
                        #{id}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    No individual expense IDs listed for this period.
                  </p>
                )}
              </div>

              {/* 4. EXPENSE CATEGORIES BREAKDOWN */}
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
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {categoryList.map((cat, idx) => (
                          <tr key={cat.category_id || idx} className="hover:bg-slate-50/50">
                            <td className="px-3 py-2.5 font-bold text-slate-800">
                              {cat.category_name}
                            </td>
                            <td className="px-3 py-2.5 text-right font-medium text-slate-600">
                              {cat.expenses_count ?? "—"}
                            </td>
                            <td className="px-3 py-2.5 text-right font-bold text-rose-600">
                              {formatINR(cat.expense_amount)}
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
          ) : (
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
                  <strong className="text-base font-black text-slate-900">{report.total_expenses_count ?? 0}</strong>
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
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {cumulativeCategoryList.map((cat, idx) => (
                          <tr key={cat.category_id || idx}>
                            <td className="px-3 py-2.5 font-bold text-slate-800">{cat.category_name}</td>
                            <td className="px-3 py-2.5 text-right font-medium text-slate-600">
                              {cat.total_expenses_count ?? cat.expenses_count ?? "—"}
                            </td>
                            <td className="px-3 py-2.5 text-right font-bold text-rose-600">
                              {formatINR(cat.total_expense_amount ?? cat.expense_amount)}
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

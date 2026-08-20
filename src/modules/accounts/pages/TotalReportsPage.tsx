// src/modules/accounts/pages/TotalReportsPage.tsx

"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Calendar, CheckCircle2 } from "lucide-react";
import { accountsService } from "../services/accounts.service";
import { TotalReportItem, TotalReportsListResponse } from "../types/accounts.types";

const formatINR = (val: number | undefined | null) => {
  if (val === undefined || val === null) return "₹0";
  const formatted = Math.abs(val).toLocaleString("en-IN");
  return val < 0 ? `-₹${formatted}` : `₹${formatted}`;
};

export default function TotalReportsPage() {
  const [data, setData] = useState<TotalReportsListResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [toast, setToast] = useState<string | null>(null);

  const fetchTotals = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await accountsService.getTotalReports({ report_date: selectedDate || undefined });
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchTotals();
  }, [fetchTotals]);

  const handleGenerateTotal = async () => {
    const targetDate = selectedDate || new Date().toISOString().split("T")[0];
    try {
      setIsGenerating(true);
      const res = await accountsService.generateTotalReport({ report_date: targetDate });
      setToast(res.message || `Total Report generated for ${targetDate}`);
      await fetchTotals();
    } catch {
      setToast("Failed to generate total report");
    } finally {
      setIsGenerating(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const reports: TotalReportItem[] = data?.reports || [];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {toast && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link href="/accounts" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">Total Combined Daily Reports</h1>
            <p className="text-xs text-slate-500">Daily reconciliation of Sales, Expenses, and Accounts</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
          />
          <button
            onClick={handleGenerateTotal}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
            {isGenerating ? "Generating..." : "Generate Total Report"}
          </button>
        </div>
      </div>

      {/* Daily Reports Cards */}
      {isLoading ? (
        <div className="p-8 text-center text-slate-400 animate-pulse">Loading total reports...</div>
      ) : reports.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-sm">
          No total report records available.
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((dayReport) => (
            <div key={dayReport.date} className="bg-white border border-slate-200/90 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  Date: {dayReport.date}
                </div>
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sales Section */}
                <div className="space-y-2 border-r-0 md:border-r border-slate-100 pr-0 md:pr-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Sales Report</h4>
                  {dayReport.sales_report ? (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-lg">
                        <span className="text-slate-400">Sales Amount:</span>
                        <p className="font-bold text-slate-900">{formatINR(dayReport.sales_report.sales_amount)}</p>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg">
                        <span className="text-slate-400">Cash Collection:</span>
                        <p className="font-bold text-emerald-600">{formatINR(dayReport.sales_report.cash_collection)}</p>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg">
                        <span className="text-slate-400">Today Collection:</span>
                        <p className="font-bold text-emerald-600">{formatINR(dayReport.sales_report.today_orders_collection)}</p>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg">
                        <span className="text-slate-400">Pending Amount:</span>
                        <p className="font-bold text-amber-600">{formatINR(dayReport.sales_report.today_orders_pending)}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No sales report logged</p>
                  )}
                </div>

                {/* Expense Section */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600">Expense Report</h4>
                  {dayReport.expense_report ? (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-lg">
                        <span className="text-slate-400">Total Expenses:</span>
                        <p className="font-bold text-slate-900">{dayReport.expense_report.total_expenses}</p>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg">
                        <span className="text-slate-400">Expense Amount:</span>
                        <p className="font-bold text-rose-600">{formatINR(dayReport.expense_report.total_expense_amount)}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No expense report logged</p>
                  )}
                </div>
              </div>

              {/* Account Breakdown Logs */}
              {dayReport.accounts_report && dayReport.accounts_report.length > 0 && (
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
                  <h5 className="text-[11px] font-semibold text-slate-500 uppercase mb-2">Account Breakdown</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {dayReport.accounts_report.map((acc) => (
                      <div key={acc.id} className="p-2 bg-white border border-slate-200/70 rounded-lg text-xs">
                        <div className="font-semibold text-slate-800">{acc.account_name}</div>
                        <div className="flex justify-between text-slate-500 mt-1">
                          <span>Sales: {formatINR(acc.today_sales)}</span>
                          <span className={acc.current_balance < 0 ? "text-rose-600 font-bold" : "font-bold text-slate-900"}>
                            Bal: {formatINR(acc.current_balance)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
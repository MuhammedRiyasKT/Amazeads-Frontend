// src/modules/accounts/pages/AccountsReportsPage.tsx

"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { accountsService } from "../services/accounts.service";
import { AccountsReportListResponse, AccountReportItem } from "../types/accounts.types";

const formatINR = (val: number | undefined | null) => {
  if (val === undefined || val === null) return "₹0";
  const formatted = Math.abs(val).toLocaleString("en-IN");
  return val < 0 ? `-₹${formatted}` : `₹${formatted}`;
};

export default function AccountsReportsPage() {
  const [data, setData] = useState<AccountsReportListResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  const [reportDate, setReportDate] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const fetchReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await accountsService.getAccountsReports({
        page,
        page_size: pageSize,
        report_date: reportDate || undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
      });
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [page, reportDate, fromDate, toDate]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const totals = data?.summary_totals;
  const reports: AccountReportItem[] = data?.reports || [];
  const totalPages = Math.ceil((data?.total_count || 0) / pageSize);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
        <Link href="/accounts" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Detailed Accounts Reports</h1>
          <p className="text-xs text-slate-500">Historical ledgers and summary totals per account</p>
        </div>
      </div>

      {/* Summary Totals Cards */}
      {totals && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-white p-3.5 border border-slate-200 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Today Sales Sum</span>
            <p className="text-lg font-bold text-slate-900 mt-1">{formatINR(totals.today_sales_sum)}</p>
          </div>
          <div className="bg-white p-3.5 border border-slate-200 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Sales Sum</span>
            <p className="text-lg font-bold text-indigo-600 mt-1">{formatINR(totals.total_sales_sum)}</p>
          </div>
          <div className="bg-white p-3.5 border border-slate-200 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Today Expense Sum</span>
            <p className="text-lg font-bold text-rose-600 mt-1">{formatINR(totals.today_expense_sum)}</p>
          </div>
          <div className="bg-white p-3.5 border border-slate-200 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Expense Sum</span>
            <p className="text-lg font-bold text-rose-700 mt-1">{formatINR(totals.total_expense_sum)}</p>
          </div>
          <div className="bg-white p-3.5 border border-slate-200 rounded-xl col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Net Balance Sum</span>
            <p className={`text-lg font-bold mt-1 ${totals.net_balance_sum < 0 ? "text-rose-600" : "text-emerald-600"}`}>
              {formatINR(totals.net_balance_sum)}
            </p>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 border border-slate-200/80 rounded-xl flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Filter className="w-4 h-4" /> Filters:
        </div>
        <input
          type="date"
          value={reportDate}
          onChange={(e) => { setReportDate(e.target.value); setPage(1); }}
          className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
        />
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <span>From:</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
          />
          <span>To:</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => { setToDate(e.target.value); setPage(1); }}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
          />
        </div>
        {(reportDate || fromDate || toDate) && (
          <button
            onClick={() => { setReportDate(""); setFromDate(""); setToDate(""); setPage(1); }}
            className="text-xs text-rose-600 hover:underline font-medium"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Reports Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 animate-pulse">Loading detailed reports...</div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No report records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Account</th>
                  <th className="px-5 py-3 text-right">Today Sales</th>
                  <th className="px-5 py-3 text-right">Total Sales</th>
                  <th className="px-5 py-3 text-right">Today Expense</th>
                  <th className="px-5 py-3 text-right">Total Expense</th>
                  <th className="px-5 py-3 text-right">Current Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((item) => {
                  const isNeg = item.current_balance < 0;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-3.5 font-medium text-slate-900">{item.date}</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-700">{item.account_name}</td>
                      <td className="px-5 py-3.5 text-right font-medium text-emerald-600">{formatINR(item.today_sales)}</td>
                      <td className="px-5 py-3.5 text-right text-slate-600">{formatINR(item.total_sales)}</td>
                      <td className="px-5 py-3.5 text-right font-medium text-rose-600">{formatINR(item.today_expense)}</td>
                      <td className="px-5 py-3.5 text-right text-slate-600">{formatINR(item.total_expense)}</td>
                      <td className={`px-5 py-3.5 text-right font-bold ${isNeg ? "text-rose-600" : "text-slate-900"}`}>
                        {formatINR(item.current_balance)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Page {page} of {totalPages} ({data?.total_count} records)</span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
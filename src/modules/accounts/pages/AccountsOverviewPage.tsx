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
  Banknote,
  FileSpreadsheet,
  Layers,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Building2,
} from "lucide-react";
import { accountsService } from "../services/accounts.service";
import { AccountsSummaryResponse, PeriodType } from "../types/accounts.types";

const formatINR = (val: number | undefined | null) => {
  if (val === undefined || val === null) return "₹0";
  const formatted = Math.abs(val).toLocaleString("en-IN");
  return val < 0 ? `-₹${formatted}` : `₹${formatted}`;
};

export default function AccountsOverviewPage() {
  const [data, setData] = useState<AccountsSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [period, setPeriod] = useState<PeriodType>("day");
  const [selectedDate, setSelectedDate] = useState<string>("");

  const loadSummary = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = selectedDate
        ? await accountsService.getSummary({ report_date: selectedDate })
        : await accountsService.getSummary({ period_type: period });
      setData(res);
    } catch {
      setError("Unable to load accounts summary data");
    } finally {
      setIsLoading(false);
    }
  }, [period, selectedDate]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const handleGenerate = async () => {
    const targetDate =
      selectedDate || data?.summary?.date || new Date().toISOString().split("T")[0];
    try {
      setIsGenerating(true);
      const res = await accountsService.generateAccountsReport({ report_date: targetDate });
      setSuccessMsg(res.message || `Accounts Report generated for ${targetDate}`);
      await loadSummary();
    } catch {
      setError("Failed to generate accounts report");
    } finally {
      setIsGenerating(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const summary = data?.summary;
  const breakdown = useMemo(() => data?.accounts_breakdown || [], [data]);

  // Dynamic Bank vs Cash Collection Calculation
  const { bankCollection, cashCollection, bankAccountsCount } = useMemo(() => {
    let bankSum = 0;
    let cashSum = 0;
    let bankCount = 0;

    breakdown.forEach((acc) => {
      const isCash = acc.account_name.trim().toLowerCase() === "cash";
      if (isCash) {
        cashSum += acc.today_collection || 0;
      } else {
        bankSum += acc.today_collection || 0;
        bankCount += 1;
      }
    });

    return { bankCollection: bankSum, cashCollection: cashSum, bankAccountsCount: bankCount };
  }, [breakdown]);

  // Overall Financial Summary Cumulative Graph Calculations
  const totSales = summary?.total_sales ?? 0;
  const totCollection = summary?.total_collection ?? 0;
  const totPending = summary?.total_pending ?? 0;
  const totOrders = summary?.total_orders ?? 0;

  const maxVal = Math.max(totSales, totCollection, totPending, 1);
  const salesHeight = totSales > 0 ? Math.max(Math.round((totSales / maxVal) * 100), 10) : 4;
  const collectionHeight =
    totCollection > 0 ? Math.max(Math.round((totCollection / maxVal) * 100), 10) : 4;
  const pendingHeight = totPending > 0 ? Math.max(Math.round((totPending / maxVal) * 100), 10) : 4;

  const realizationRate = totSales > 0 ? Math.round((totCollection / totSales) * 100) : 0;
  const pendingRate = totSales > 0 ? Math.round((totPending / totSales) * 100) : 0;

  return (
    <div className="p-4 md:p-5 space-y-5 max-w-7xl mx-auto">
      {/* Toast Feedback */}
      {successMsg && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && !isLoading && (
        <div className="flex items-center justify-between p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={loadSummary} className="font-bold underline hover:text-rose-900">
            Retry
          </button>
        </div>
      )}

      {/* 1. Header & Filter Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-bold text-slate-900">Accounts Overview</h1>
            <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-semibold rounded-md">
              Finance
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time cash collections, expenses, and account ledgers.
          </p>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Period Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600">
            {(["day", "week", "month", "year"] as PeriodType[]).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setSelectedDate("");
                  setPeriod(p);
                }}
                className={`px-2.5 py-1 rounded-md capitalize transition-all ${
                  period === p && !selectedDate
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "hover:text-slate-900"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Date Picker */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
          />

          {/* Generate Report */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
            {isGenerating ? "Generating..." : "Generate Report"}
          </button>

          {/* Quick Links */}
          {/* <Link
            href="/accounts/reports"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" /> Reports
          </Link>
          <Link
            href="/accounts/total-reports"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 transition"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" /> Total
          </Link> */}
        </div>
      </div>

      {isLoading && !data ? (
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="h-72 bg-slate-100 rounded-xl"></div>
            <div className="h-72 bg-slate-100 rounded-xl"></div>
          </div>
        </div>
      ) : (
        <>
          {/* 2. COMPACT 6-KPI ROW (Single Horizontal Row on Desktop) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
             {/* Total Orders */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total Orders
                </span>
                <ShoppingBag className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <div className="text-base md:text-lg font-extrabold text-slate-900">
                {summary?.total_orders ?? 0}
              </div>
              <div className="text-[10px] text-slate-400">Orders Processed</div>
            </div>
            {/* Today Sales */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Today Sales
                </span>
                <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <div className="text-base md:text-lg font-extrabold text-slate-900">
                {formatINR(summary?.today_sales)}
              </div>
              <div className="text-[10px] text-slate-400">Period Total</div>
            </div>

            {/* Collection */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Collection
                </span>
                <Wallet className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-base md:text-lg font-extrabold text-emerald-600">
                {formatINR(summary?.today_collection)}
              </div>
              <div className="text-[10px] text-slate-400">Received</div>
            </div>

            {/* Pending */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Pending
                </span>
                <Clock3 className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-base md:text-lg font-extrabold text-amber-600">
                {formatINR(summary?.today_pending)}
              </div>
              <div className="text-[10px] text-slate-400">Outstanding</div>
            </div>

            {/* Expenses */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Expenses
                </span>
                <Receipt className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <div className="text-base md:text-lg font-extrabold text-rose-600">
                {formatINR(summary?.today_expenses)}
              </div>
              <div className="text-[10px] text-slate-400">Today Spent</div>
            </div>

            {/* Net Amount */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Net Amount
                </span>
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-700" />
              </div>
              <div
                className={`text-base md:text-lg font-extrabold ${
                  (summary?.net_amount ?? 0) < 0 ? "text-rose-600" : "text-slate-900"
                }`}
              >
                {formatINR(summary?.net_amount)}
              </div>
              <div className="text-[10px] text-slate-400">Collection - Expense</div>
            </div>
          </div>

          {/* 3. SIDE-BY-SIDE GRID: Left (Overall Financial Summary Vertical Graph) & Right (Account Breakdown + Bank/Cash) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
            
            {/* LEFT SIDE: Overall Financial Summary (Vertical Graph) */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-4 md:p-5 shadow-xs flex flex-col justify-between h-full">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Overall Financial Summary
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500">
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-100">
                      {totOrders} Total Orders
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-100">
                      Realized: {realizationRate}%
                    </span>
                  </div>
                </div>

                {/* Vertical Graph Chart Area */}
                <div className="relative pt-6 pb-2 my-auto">
                  {/* Background Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-30">
                    <div className="border-b border-dashed border-slate-200 w-full h-0"></div>
                    <div className="border-b border-dashed border-slate-200 w-full h-0"></div>
                    <div className="border-b border-dashed border-slate-200 w-full h-0"></div>
                    <div className="border-b border-slate-200 w-full h-0"></div>
                  </div>

                  {/* 3 Vertical Bars: Total Sales, Total Collection, Total Pending */}
                  <div className="relative z-10 grid grid-cols-3 gap-3 md:gap-6 h-52 items-end px-2 md:px-6">
                    
                    {/* 1. Total Sales Bar */}
                    <div className="flex flex-col items-center h-full justify-end group">
                      <div className="mb-1.5 text-center transition-transform group-hover:-translate-y-0.5 duration-200">
                        <span className="text-[10px] md:text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 shadow-xs">
                          {formatINR(totSales)}
                        </span>
                      </div>
                      <div className="w-full max-w-[56px] bg-slate-100 rounded-t-xl overflow-hidden flex flex-col justify-end p-1 h-full max-h-[160px]">
                        <div
                          style={{ height: `${salesHeight}%` }}
                          className="w-full bg-gradient-to-t from-indigo-600 to-indigo-500 rounded-t-lg transition-all duration-700 shadow-xs"
                        />
                      </div>
                      <div className="mt-2 text-center">
                        <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-800">
                          <TrendingUp className="w-3 h-3 text-indigo-600" /> Total Sales
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Cumulative</span>
                      </div>
                    </div>

                    {/* 2. Total Collection Bar */}
                    <div className="flex flex-col items-center h-full justify-end group">
                      <div className="mb-1.5 text-center transition-transform group-hover:-translate-y-0.5 duration-200">
                        <span className="text-[10px] md:text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 shadow-xs">
                          {formatINR(totCollection)}
                        </span>
                      </div>
                      <div className="w-full max-w-[56px] bg-slate-100 rounded-t-xl overflow-hidden flex flex-col justify-end p-1 h-full max-h-[160px]">
                        <div
                          style={{ height: `${collectionHeight}%` }}
                          className="w-full bg-gradient-to-t from-emerald-600 to-emerald-500 rounded-t-lg transition-all duration-700 shadow-xs"
                        />
                      </div>
                      <div className="mt-2 text-center">
                        <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-800">
                          <Wallet className="w-3 h-3 text-emerald-600" /> Collection
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">{realizationRate}% Realized</span>
                      </div>
                    </div>

                    {/* 3. Total Pending Bar */}
                    <div className="flex flex-col items-center h-full justify-end group">
                      <div className="mb-1.5 text-center transition-transform group-hover:-translate-y-0.5 duration-200">
                        <span className="text-[10px] md:text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 shadow-xs">
                          {formatINR(totPending)}
                        </span>
                      </div>
                      <div className="w-full max-w-[56px] bg-slate-100 rounded-t-xl overflow-hidden flex flex-col justify-end p-1 h-full max-h-[160px]">
                        <div
                          style={{ height: `${pendingHeight}%` }}
                          className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-lg transition-all duration-700 shadow-xs"
                        />
                      </div>
                      <div className="mt-2 text-center">
                        <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-800">
                          <Clock3 className="w-3 h-3 text-amber-600" /> Pending
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">{pendingRate}% Outstanding</span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Bottom Realization Progress Bar */}
              <div className="pt-3 border-t border-slate-100 space-y-1">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                  <div
                    style={{ width: `${realizationRate}%` }}
                    className="h-full bg-emerald-500 transition-all duration-500"
                    title={`Collection: ${formatINR(totCollection)}`}
                  />
                  <div
                    style={{ width: `${pendingRate}%` }}
                    className="h-full bg-amber-400 transition-all duration-500"
                    title={`Pending: ${formatINR(totPending)}`}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>Realized: {realizationRate}%</span>
                  <span>Outstanding: {pendingRate}%</span>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: Account Breakdown Table + Bank/Cash Cards */}
            <div className="space-y-4 flex flex-col justify-between">
              
              {/* Account Breakdown Table */}
              <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs flex-1 flex flex-col">
                <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-slate-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Account Breakdown
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {breakdown.length} Accounts Active
                  </span>
                </div>

                {breakdown.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs my-auto">
                    No account data available for this period.
                  </div>
                ) : (
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                        <tr>
                          <th className="px-3.5 py-2.5">Account</th>
                          <th className="px-3.5 py-2.5 text-right">Collection</th>
                          <th className="px-3.5 py-2.5 text-right">Expense</th>
                          <th className="px-3.5 py-2.5 text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {breakdown.map((acc) => {
                          const isNeg = acc.current_balance < 0;
                          return (
                            <tr key={acc.account_id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="px-3.5 py-2.5 font-semibold text-slate-800 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                {acc.account_name}
                              </td>
                              <td className="px-3.5 py-2.5 text-right font-semibold text-emerald-600">
                                {formatINR(acc.today_collection)}
                              </td>
                              <td className="px-3.5 py-2.5 text-right font-semibold text-slate-600">
                                {formatINR(acc.today_expense)}
                              </td>
                              <td
                                className={`px-3.5 py-2.5 text-right font-bold ${
                                  isNeg ? "text-rose-600" : "text-slate-900"
                                }`}
                              >
                                {formatINR(acc.current_balance)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Bank Collection & Cash Collection Mini-Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Bank Collection */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Bank Collection
                      </span>
                    </div>
                    <div className="text-base font-bold text-slate-900">{formatINR(bankCollection)}</div>
                    <div className="text-[10px] text-slate-400">
                      {bankAccountsCount} Bank Accounts
                    </div>
                  </div>
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Landmark className="w-4 h-4" />
                  </div>
                </div>

                {/* Cash Collection */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Cash Collection
                      </span>
                    </div>
                    <div className="text-base font-bold text-emerald-600">
                      {formatINR(cashCollection)}
                    </div>
                    <div className="text-[10px] text-slate-400">Physical Cash</div>
                  </div>
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
              </div>

            </div>

          </div>
        </>
      )}
    </div>
  );
}
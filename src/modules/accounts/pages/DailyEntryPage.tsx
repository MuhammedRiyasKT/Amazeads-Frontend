// src/modules/accounts/pages/DailyEntryPage.tsx

"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ClipboardCheck,
  RotateCcw,
  ShoppingBag,
  TrendingUp,
  Wallet,
  Clock3,
  Receipt,
  ArrowUpDown,
  Landmark,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { accountsService } from "../services/accounts.service";
import { AccountsSummaryResponse } from "../types/accounts.types";

const formatINR = (val: number | undefined | null) => {
  if (val === undefined || val === null || isNaN(val)) return "₹0";
  const formatted = Math.abs(val).toLocaleString("en-IN");
  return val < 0 ? `-₹${formatted}` : `₹${formatted}`;
};

const formatDateReadable = (dateStr?: string) => {
  if (!dateStr) return "N/A";
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

export default function DailyEntryPage() {
  const [data, setData] = useState<AccountsSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<
    "Pending Verification" | "Verified & Submitted"
  >("Pending Verification");

  const loadData = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      const res = await accountsService.getDailyEntrySummary();
      setData(res);
    } catch (err: any) {
      console.error("Failed to fetch daily entry summary:", err);
      setError(
        err?.response?.data?.message || "Unable to load daily accounts summary data."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle frontend dummy verification action
  const handleVerifyAndSubmit = () => {
    setVerificationStatus("Verified & Submitted");
    setToastMsg("Daily entry verified successfully");
    setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };

  const summary = data?.summary;
  const accountsBreakdown = data?.accounts_breakdown || [];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-800">
      {/* Toast Alert Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-[100] flex items-center gap-2.5 px-4 py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xl border border-emerald-700 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6 text-indigo-600" />
              <span>Daily Entry</span>
            </h1>

            {/* Prominently displayed API summary date */}
            {summary?.date && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-extrabold rounded-full">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>{formatDateReadable(summary.date)}</span>
                <span className="text-[10px] text-indigo-400 font-medium">
                  ({summary.date})
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500 font-semibold">
            Review and verify the daily accounts entry.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={isLoading || isRefreshing}
            className="h-9 px-3.5 bg-white border border-slate-250 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors disabled:opacity-50"
            title="Refresh Daily Entry Data"
          >
            <RotateCcw
              className={`w-3.5 h-3.5 text-slate-500 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-6 animate-pulse">
          {/* Skeleton KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-xl" />
            ))}
          </div>

          {/* Skeleton Content Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-72 bg-slate-100 rounded-xl" />
            <div className="h-72 bg-slate-100 rounded-xl" />
          </div>
        </div>
      ) : error ? (
        /* Error State Card */
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-4 shadow-xs">
          <div className="h-12 w-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black text-slate-800">
              Failed to load daily entry
            </h3>
            <p className="text-xs text-slate-500 font-medium max-w-md">
              {error}
            </p>
          </div>
          <button
            type="button"
            onClick={() => loadData()}
            className="px-4.5 h-9 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* 2. Daily Summary Cards (6 KPIs) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Total Orders */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs space-y-1 hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total Orders
                </span>
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-base md:text-xl font-extrabold text-slate-900">
                {summary?.total_orders ?? 0}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold">
                Daily Orders
              </div>
            </div>

            {/* Today Sales */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs space-y-1 hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Today Sales
                </span>
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-base md:text-xl font-extrabold text-slate-900">
                {formatINR(summary?.today_sales)}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold">
                Total Billed
              </div>
            </div>

            {/* Today Collection */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs space-y-1 hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Today Collection
                </span>
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-base md:text-xl font-extrabold text-emerald-600">
                {formatINR(summary?.today_collection)}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold">
                Cash Received
              </div>
            </div>

            {/* Today Pending */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs space-y-1 hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Today Pending
                </span>
                <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                  <Clock3 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-base md:text-xl font-extrabold text-amber-600">
                {formatINR(summary?.today_pending)}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold">
                Due Amount
              </div>
            </div>

            {/* Today Expenses */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs space-y-1 hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Today Expenses
                </span>
                <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                  <Receipt className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-base md:text-xl font-extrabold text-rose-600">
                {formatINR(summary?.today_expenses)}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold">
                Total Expenses
              </div>
            </div>

            {/* Net Amount */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs space-y-1 hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Net Amount
                </span>
                <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </div>
              <div
                className={`text-base md:text-xl font-extrabold ${
                  (summary?.net_amount ?? 0) < 0
                    ? "text-rose-600"
                    : "text-slate-900"
                }`}
              >
                {formatINR(summary?.net_amount)}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold">
                Collection - Expense
              </div>
            </div>
          </div>

          {/* 3 & 4. Main Section: Accounts Breakdown (Left 2/3) & Verification Card (Right 1/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Accounts Breakdown Table */}
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-slate-600" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Accounts Breakdown
                  </h2>
                </div>
                <span className="text-xs text-slate-500 font-bold bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                  {accountsBreakdown.length} Accounts
                </span>
              </div>

              {accountsBreakdown.length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-xs font-semibold">
                  No accounts breakdown available for this entry date.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/70 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-3">Account</th>
                        <th className="px-4 py-3 text-right">Today's Collection</th>
                        <th className="px-4 py-3 text-right">Today's Expense</th>
                        <th className="px-4 py-3 text-right">Current Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold">
                      {accountsBreakdown.map((item) => {
                        const isNeg = (item.current_balance ?? 0) < 0;
                        return (
                          <tr
                            key={item.account_id}
                            className="hover:bg-slate-50/80 transition-colors"
                          >
                            <td className="px-4 py-3.5 font-bold text-slate-800 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
                              <span className="capitalize">{item.account_name}</span>
                            </td>
                            <td className="px-4 py-3.5 text-right font-bold text-emerald-600">
                              {formatINR(item.today_collection)}
                            </td>
                            <td className="px-4 py-3.5 text-right font-bold text-slate-600">
                              {formatINR(item.today_expense)}
                            </td>
                            <td
                              className={`px-4 py-3.5 text-right font-black ${
                                isNeg ? "text-rose-600" : "text-slate-900"
                              }`}
                            >
                              {formatINR(item.current_balance)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 4. Verification Section Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Verification
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Daily entry sign-off & confirmation
                  </p>
                </div>
              </div>

              {/* Entry Date Info */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Entry Date
                </div>
                <div className="text-sm font-extrabold text-slate-800 flex items-center justify-between">
                  <span>{formatDateReadable(summary?.date)}</span>
                  <span className="text-xs font-mono font-medium text-slate-500">
                    {summary?.date || "N/A"}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Current Status
                </label>
                <div>
                  {verificationStatus === "Pending Verification" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-full">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Pending Verification</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified & Submitted</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Verify & Submit Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleVerifyAndSubmit}
                  className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors"
                >
                  <ShieldCheck size={16} />
                  <span>Verify & Submit</span>
                </button>
                <p className="text-[10px] text-slate-400 font-medium text-center mt-2">
                  Confirms accuracy of daily collections and accounts ledger.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

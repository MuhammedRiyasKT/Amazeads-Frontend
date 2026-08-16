// src/modules/accounts/components/SalesReportDetailsDrawer.tsx

"use client";

import React from "react";
import { X, Calendar, TrendingUp, Landmark, List, User, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { SalesReport } from "../types";

interface SalesReportDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  report: SalesReport | null;
}

export default function SalesReportDetailsDrawer({
  isOpen,
  onClose,
  report,
}: SalesReportDetailsDrawerProps) {
  if (!isOpen || !report) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-[2000] flex justify-end">
      {/* Backdrop click close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Details drawer panel */}
      <div className="relative bg-white w-full max-w-xl h-full border-l shadow-2xl flex flex-col z-10 animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="space-y-0.5">
            <h3 className="font-extrabold text-slate-900 text-sm uppercase">Sales Report Details</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {formatDate(report.date)}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SECTION 1: TODAY'S SUMMARY */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b pb-1 flex items-center gap-1.5">
              <TrendingUp size={12} /> Today's Summary
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Today's Orders</span>
                <strong className="text-slate-800 text-lg font-black block mt-0.5">{report.orders || 0}</strong>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Today's Sales</span>
                <strong className="text-slate-800 text-lg font-black block mt-0.5">₹{(report.sales_amount || 0).toLocaleString("en-IN")}.00</strong>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Today's Collection</span>
                <strong className="text-emerald-700 text-lg font-black block mt-0.5">₹{(report.cash_collection || 0).toLocaleString("en-IN")}.00</strong>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Today's Pending</span>
                <strong className="text-amber-700 text-lg font-black block mt-0.5">₹{(report.today_orders_pending || 0).toLocaleString("en-IN")}.00</strong>
              </div>
            </div>
          </div>

          {/* SECTION 2: OVERALL SUMMARY */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b pb-1 flex items-center gap-1.5">
              <TrendingUp size={12} /> Overall Summary
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Orders</span>
                <strong className="text-slate-800 text-base font-black block mt-0.5">{report.total_orders || 0}</strong>
              </div>
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Sales</span>
                <strong className="text-slate-800 text-base font-black block mt-0.5">₹{(report.total_sales_amount || 0).toLocaleString("en-IN")}.00</strong>
              </div>
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Collection</span>
                <strong className="text-emerald-700 text-base font-black block mt-0.5">₹{(report.total_cash_collection || 0).toLocaleString("en-IN")}.00</strong>
              </div>
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Pending</span>
                <strong className="text-amber-700 text-base font-black block mt-0.5">₹{(report.total_cash_pending || 0).toLocaleString("en-IN")}.00</strong>
              </div>
            </div>
          </div>

          {/* SECTION 3: ACCOUNT-WISE COLLECTION */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b pb-1 flex items-center gap-1.5">
              <Landmark size={12} /> Account-wise Collection
            </h4>
            <div className="bg-slate-50/50 border border-slate-100 rounded-xl overflow-hidden text-xs">
              {report.account_logs && report.account_logs.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-100/50 text-[10px] font-bold text-slate-400 uppercase">
                    <span>Account</span>
                    <span>Collection</span>
                  </div>
                  {report.account_logs.map((log, index) => (
                    <div key={index} className="flex items-center justify-between px-4 py-3 font-semibold text-slate-700">
                      <span>{log.account_name}</span>
                      <strong className="text-slate-900 font-bold">₹{log.amount.toLocaleString("en-IN")}.00</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 font-medium italic p-4 text-center">No account-wise details available.</p>
              )}
            </div>
          </div>

         {/* SECTION 4: ASSOCIATED ORDERS */}
<div className="space-y-3">
  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b pb-1 flex items-center gap-1.5">
    <List size={12} /> Associated Orders
  </h4>

  {report.orders_ids && report.orders_ids.length > 0 ? (
    <div className="flex flex-wrap items-center gap-2">
      {report.orders_ids.map((orderId) => (
        <span
          key={orderId}
          className="inline-flex items-center px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg"
        >
          #{orderId}
        </span>
      ))}
    </div>
  ) : (
    <p className="text-slate-400 font-medium italic text-center py-2">
      No associated orders on this date.
    </p>
  )}
</div>

          {/* SECTION 5: REPORT INFORMATION */}
          <div className="space-y-3 text-xs text-slate-600">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b pb-1 flex items-center gap-1.5">
              <Clock size={12} /> Report Metadata
            </h4>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1"><User size={10}/> Created By</span>
                <span className="font-bold text-slate-800">{report.created_by_name || "System"}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1"><Calendar size={10}/> Created On</span>
                <span className="font-semibold text-slate-700">{formatDateTime(report.created_on)}</span>
              </div>
              {report.updated_on && (
                <>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1"><User size={10}/> Updated By</span>
                    <span className="font-bold text-slate-800">{report.updated_by_name || "—"}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1"><Calendar size={10}/> Updated On</span>
                    <span className="font-semibold text-slate-700">{formatDateTime(report.updated_on)}</span>
                  </div>
                </>
              )}
            </div>
            
            {/* Updated Orders IDs */}
            {report.updated_orders_ids && report.updated_orders_ids.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Updated Orders IDs</span>
                <div className="flex flex-wrap gap-1.5">
                  {report.updated_orders_ids.map((id) => (
                    <span key={id} className="inline-block bg-slate-100 border text-[10px] font-bold px-1.5 py-0.5 rounded text-slate-600">
                      #{id}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex items-center justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

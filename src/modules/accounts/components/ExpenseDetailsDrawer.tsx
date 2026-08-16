// src/modules/accounts/components/ExpenseDetailsDrawer.tsx

"use client";

import React from "react";
import { X, Calendar, CreditCard, DollarSign, Clock, ShieldAlert, AlignLeft, User, Image as ImageIcon } from "lucide-react";
import { Expense } from "../types";

interface ExpenseDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  onPreviewAttachment: (url: string) => void;
}

export default function ExpenseDetailsDrawer({
  isOpen,
  onClose,
  expense,
  onPreviewAttachment,
}: ExpenseDetailsDrawerProps) {
  if (!isOpen || !expense) return null;

  const formatDate = (dateStr?: string, includeTime = false) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      if (includeTime) {
        return d.toLocaleDateString("en-US", { 
          day: "numeric", 
          month: "short", 
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });
      }
      return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "Paid") {
      return (
        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider inline-block">
          Paid
        </span>
      );
    }
    return (
      <span className="bg-amber-50 text-amber-700 border border-amber-200 font-extrabold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider inline-block">
        Pending
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-[2000] flex justify-end">
      {/* Backdrop click close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Details Drawer */}
      <div className="relative bg-white w-full max-w-md h-full border-l shadow-2xl flex flex-col z-10 animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-extrabold text-slate-900 text-sm uppercase">
            Expense Details
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Info */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Expense #{expense.id}
              </span>
              {getStatusBadge(expense.status)}
            </div>
            
            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-900 text-sm">{expense.category_name}</h4>
              {expense.category_description && (
                <p className="text-xs text-slate-400 font-semibold">{expense.category_description}</p>
              )}
            </div>

            <div className="border-t border-slate-200/60 pt-4 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Amount</span>
              <strong className="text-slate-900 text-2xl font-black">
                ₹{(expense.amount || 0).toLocaleString("en-IN")}.00
              </strong>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="space-y-4 text-xs text-slate-600">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b pb-1">
              Expense Metadata
            </h4>

            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
              {/* Date */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Calendar size={12} /> Expense Date
                </span>
                <span className="font-bold text-slate-800 block text-xs">
                  {formatDate(expense.expense_date)}
                </span>
              </div>

              {/* Account */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <CreditCard size={12} /> Paid From Account
                </span>
                <span className="font-bold text-slate-800 block text-xs">
                  {expense.account_name}
                </span>
              </div>

              {/* Payment Type */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <DollarSign size={12} /> Payment Type
                </span>
                <span className="font-bold text-slate-800 block text-xs">
                  {expense.payment_type}
                </span>
              </div>

              {/* Added By */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <User size={12} /> Added By
                </span>
                <span className="font-bold text-slate-800 block text-xs">
                  {expense.created_by_name || "—"}
                </span>
              </div>

              {/* Created On */}
              <div className="space-y-1 col-span-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Clock size={12} /> Created On
                </span>
                <span className="font-semibold text-slate-700 block text-xs">
                  {formatDate(expense.created_on, true)}
                </span>
              </div>

              {/* Updated On */}
              {expense.updated_on && (
                <div className="space-y-1 col-span-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Clock size={12} /> Last Updated
                  </span>
                  <span className="font-semibold text-slate-700 block text-xs">
                    {formatDate(expense.updated_on, true)} {expense.updated_by_name ? `by ${expense.updated_by_name}` : ""}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3 text-xs">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b pb-1">
              Description
            </h4>
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex items-start gap-2.5">
              <AlignLeft className="text-slate-400 shrink-0 mt-0.5" size={14} />
              <p className="text-slate-700 leading-relaxed font-semibold">
                {expense.description || "No description provided."}
              </p>
            </div>
          </div>

          {/* Attachment */}
          <div className="space-y-3 text-xs">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b pb-1">
              Receipt Attachment
            </h4>
            {expense.attachment_url ? (
              <div className="flex items-center justify-between border border-slate-200 bg-slate-50 rounded-xl p-3.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                    <ImageIcon size={16} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 block truncate">receipt_attachment</span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block mt-0.5">Click preview to view file</span>
                  </div>
                </div>
                <button
                  onClick={() => onPreviewAttachment(expense.attachment_url!)}
                  className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  View Attachment
                </button>
              </div>
            ) : (
              <p className="text-slate-400 font-medium italic">No receipt attached.</p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t px-6 py-4 flex items-center justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}

// src/modules/expenses/components/ExpenseSummaryCards.tsx

"use client";

import React from "react";
import { CreditCard, CheckCircle, Clock, Database } from "lucide-react";
import { Expense } from "../types";

interface ExpenseSummaryCardsProps {
  expenses: Expense[];
  totalRecords: number;
}

export default function ExpenseSummaryCards({ expenses, totalRecords }: ExpenseSummaryCardsProps) {
  // Aggregate page level values
  const pageTotalExpense = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const pagePaidExpense = expenses.reduce((sum, e) => sum + (e.status === "Paid" ? e.amount || 0 : 0), 0);
  const pagePendingExpense = expenses.reduce((sum, e) => sum + (e.status === "Pending" ? e.amount || 0 : 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
      {/* 1. Total Records */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3.5 shadow-2xs">
        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
          <Database size={20} />
        </div>
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Records</span>
          <strong className="text-slate-800 text-lg font-extrabold block mt-0.5">{totalRecords}</strong>
        </div>
      </div>

      {/* 2. Total Expense (Page) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3.5 shadow-2xs">
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
          <CreditCard size={20} />
        </div>
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Page Total Expense</span>
          <strong className="text-slate-800 text-lg font-extrabold block mt-0.5">
            ₹{pageTotalExpense.toLocaleString("en-IN")}.00
          </strong>
        </div>
      </div>

      {/* 3. Paid Amount (Page) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3.5 shadow-2xs">
        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
          <CheckCircle size={20} />
        </div>
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Page Paid</span>
          <strong className="text-emerald-700 text-lg font-extrabold block mt-0.5">
            ₹{pagePaidExpense.toLocaleString("en-IN")}.00
          </strong>
        </div>
      </div>

      {/* 4. Pending Amount (Page) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3.5 shadow-2xs">
        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
          <Clock size={20} />
        </div>
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Page Pending</span>
          <strong className="text-amber-700 text-lg font-extrabold block mt-0.5">
            ₹{pagePendingExpense.toLocaleString("en-IN")}.00
          </strong>
        </div>
      </div>
    </div>
  );
}

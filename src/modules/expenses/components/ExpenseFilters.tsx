// src/modules/expenses/components/ExpenseFilters.tsx

"use client";

import React from "react";
import { Search, X, RotateCcw } from "lucide-react";
import { ExpenseCategory, ExpenseAccount, ExpenseFilters as IExpenseFilters } from "../types";

interface ExpenseFiltersProps {
  filters: IExpenseFilters;
  onFilterChange: (updated: Partial<IExpenseFilters>) => void;
  categories: ExpenseCategory[];
  accounts: ExpenseAccount[];
  onClearFilters: () => void;
  isLoadingCategories: boolean;
  isLoadingAccounts: boolean;
}

export default function ExpenseFilters({
  filters,
  onFilterChange,
  categories,
  accounts,
  onClearFilters,
  isLoadingCategories,
  isLoadingAccounts,
}: ExpenseFiltersProps) {
  // Check if any filter is active
  const isAnyFilterActive = Boolean(
    filters.search ||
    filters.expense_category_id ||
    filters.account_id ||
    filters.payment_type ||
    filters.from_date ||
    filters.to_date ||
    filters.status
  );

  // Get matching names for chips
  const activeCategoryName = categories.find(c => c.id === filters.expense_category_id)?.category_name;
  const activeAccountName = accounts.find(a => a.id === filters.account_id)?.account_name;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col gap-3.5 w-full">
      {/* Filters Toolbar Row */}
      <div className="flex items-center gap-3 w-full flex-wrap xl:flex-nowrap">
        {/* Search */}
        <div className="relative min-w-[200px] flex-1">
          <input
            type="text"
            placeholder="Search Category..."
            value={filters.search || ""}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="w-full h-10 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
          />
          <Search size={14} className="absolute left-3 top-3.5 text-slate-400" />
        </div>

        {/* Category Dropdown */}
        {/* <div className="min-w-[150px] flex-1">
          <select
            value={filters.expense_category_id || ""}
            onChange={(e) => onFilterChange({ expense_category_id: e.target.value ? parseInt(e.target.value) : undefined })}
            className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 cursor-pointer"
          >
            <option value="">{isLoadingCategories ? "Loading Categories..." : "Category"}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.category_name}
              </option>
            ))}
          </select>
        </div> */}

        {/* Account Dropdown */}
        <div className="min-w-[150px] flex-1">
          <select
            value={filters.account_id || ""}
            onChange={(e) => onFilterChange({ account_id: e.target.value ? parseInt(e.target.value) : undefined })}
            className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 cursor-pointer"
          >
            <option value="">{isLoadingAccounts ? "Loading Accounts..." : "Account"}</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.account_name}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Type */}
        <div className="min-w-[120px] flex-1">
          <select
            value={filters.payment_type || ""}
            onChange={(e) => onFilterChange({ payment_type: e.target.value || undefined })}
            className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 cursor-pointer"
          >
            <option value="">Payment Type</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>

        {/* From Date */}
        <div className="min-w-[130px] flex-1">
          <input
            type="date"
            value={filters.from_date || ""}
            onChange={(e) => onFilterChange({ from_date: e.target.value || undefined })}
            className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 cursor-pointer"
            title="From Date"
          />
        </div>

        {/* To Date */}
        <div className="min-w-[130px] flex-1">
          <input
            type="date"
            value={filters.to_date || ""}
            onChange={(e) => onFilterChange({ to_date: e.target.value || undefined })}
            className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 cursor-pointer"
            title="To Date"
          />
        </div>

        {/* Status */}
        {/* <div className="min-w-[120px] flex-1">
          <select
            value={filters.status || ""}
            onChange={(e) => onFilterChange({ status: e.target.value || undefined })}
            className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 cursor-pointer"
          >
            <option value="">Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div> */}

        {/* Clear Filters Button */}
        {isAnyFilterActive && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1.5 h-10 px-4 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-rose-600 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
          >
            <RotateCcw size={12} /> Clear Filters
          </button>
        )}
      </div>

      {/* Active Filter Chips */}
      {isAnyFilterActive && (
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Active Filters:</span>
          
          {filters.search && (
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border text-xs px-2.5 py-0.5 rounded-full font-medium">
              Search: {filters.search}
              <button onClick={() => onFilterChange({ search: undefined })} className="hover:text-slate-900 cursor-pointer"><X size={10} /></button>
            </span>
          )}

          {filters.expense_category_id && activeCategoryName && (
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border text-xs px-2.5 py-0.5 rounded-full font-medium">
              Category: {activeCategoryName}
              <button onClick={() => onFilterChange({ expense_category_id: undefined })} className="hover:text-slate-900 cursor-pointer"><X size={10} /></button>
            </span>
          )}

          {filters.account_id && activeAccountName && (
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border text-xs px-2.5 py-0.5 rounded-full font-medium">
              Account: {activeAccountName}
              <button onClick={() => onFilterChange({ account_id: undefined })} className="hover:text-slate-900 cursor-pointer"><X size={10} /></button>
            </span>
          )}

          {filters.payment_type && (
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border text-xs px-2.5 py-0.5 rounded-full font-medium">
              Payment: {filters.payment_type}
              <button onClick={() => onFilterChange({ payment_type: undefined })} className="hover:text-slate-900 cursor-pointer"><X size={10} /></button>
            </span>
          )}

          {filters.from_date && (
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border text-xs px-2.5 py-0.5 rounded-full font-medium">
              After: {filters.from_date}
              <button onClick={() => onFilterChange({ from_date: undefined })} className="hover:text-slate-900 cursor-pointer"><X size={10} /></button>
            </span>
          )}

          {filters.to_date && (
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border text-xs px-2.5 py-0.5 rounded-full font-medium">
              Before: {filters.to_date}
              <button onClick={() => onFilterChange({ to_date: undefined })} className="hover:text-slate-900 cursor-pointer"><X size={10} /></button>
            </span>
          )}

          {filters.status && (
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border text-xs px-2.5 py-0.5 rounded-full font-medium">
              Status: {filters.status}
              <button onClick={() => onFilterChange({ status: undefined })} className="hover:text-slate-900 cursor-pointer"><X size={10} /></button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

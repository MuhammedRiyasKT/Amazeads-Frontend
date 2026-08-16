// src/modules/accounts/components/SalesReportFilters.tsx

"use client";

import React from "react";
import { X, RotateCcw } from "lucide-react";
import { SalesReportFilters } from "../types";

interface SalesReportFiltersProps {
  filters: SalesReportFilters;
  onFilterChange: (updated: Partial<SalesReportFilters>) => void;
  onClearFilters: () => void;
}

export default function SalesReportFiltersComponent({
  filters,
  onFilterChange,
  onClearFilters,
}: SalesReportFiltersProps) {
  const isAnyFilterActive = Boolean(
    filters.report_date ||
    filters.from_date ||
    filters.to_date ||
    filters.month ||
    filters.year
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col gap-3 w-full">
      {/* Horizontal Toolbar */}
      <div className="flex items-center gap-3 w-full flex-wrap xl:flex-nowrap">
        {/* Exact Report Date */}
        <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">Report Date</span>
          <input
            type="date"
            value={filters.report_date || ""}
            onChange={(e) => onFilterChange({ report_date: e.target.value || undefined })}
            className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 cursor-pointer"
          />
        </div>

        {/* From Date */}
        <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">From Date</span>
          <input
            type="date"
            value={filters.from_date || ""}
            onChange={(e) => onFilterChange({ from_date: e.target.value || undefined })}
            className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 cursor-pointer"
          />
        </div>

        {/* To Date */}
        <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">To Date</span>
          <input
            type="date"
            value={filters.to_date || ""}
            onChange={(e) => onFilterChange({ to_date: e.target.value || undefined })}
            className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 cursor-pointer"
          />
        </div>

        {/* Month */}
        <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">Month</span>
          <select
            value={filters.month || ""}
            onChange={(e) => onFilterChange({ month: e.target.value ? parseInt(e.target.value) : undefined })}
            className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 cursor-pointer font-medium text-slate-700"
          >
            <option value="">All Months</option>
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>
        </div>

        {/* Year */}
        <div className="flex flex-col gap-1 flex-1 min-w-[100px]">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">Year</span>
          <select
            value={filters.year || ""}
            onChange={(e) => onFilterChange({ year: e.target.value ? parseInt(e.target.value) : undefined })}
            className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 cursor-pointer font-medium text-slate-700"
          >
            <option value="">All Years</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
        </div>

        {/* Clear Filters */}
        {isAnyFilterActive && (
          <div className="flex flex-col pt-4">
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1.5 h-9 px-4 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-rose-600 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
            >
              <RotateCcw size={12} /> Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Chips */}
      {isAnyFilterActive && (
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2.5">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mr-1">Active Filters:</span>
          
          {filters.report_date && (
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border text-[11px] px-2.5 py-0.5 rounded-full font-bold">
              Date: {filters.report_date}
              <button onClick={() => onFilterChange({ report_date: undefined })} className="hover:text-slate-900 cursor-pointer"><X size={10} /></button>
            </span>
          )}

          {filters.from_date && (
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border text-[11px] px-2.5 py-0.5 rounded-full font-bold">
              From: {filters.from_date}
              <button onClick={() => onFilterChange({ from_date: undefined })} className="hover:text-slate-900 cursor-pointer"><X size={10} /></button>
            </span>
          )}

          {filters.to_date && (
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border text-[11px] px-2.5 py-0.5 rounded-full font-bold">
              To: {filters.to_date}
              <button onClick={() => onFilterChange({ to_date: undefined })} className="hover:text-slate-900 cursor-pointer"><X size={10} /></button>
            </span>
          )}

          {filters.month && (
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border text-[11px] px-2.5 py-0.5 rounded-full font-bold">
              Month: {filters.month}
              <button onClick={() => onFilterChange({ month: undefined })} className="hover:text-slate-900 cursor-pointer"><X size={10} /></button>
            </span>
          )}

          {filters.year && (
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border text-[11px] px-2.5 py-0.5 rounded-full font-bold">
              Year: {filters.year}
              <button onClick={() => onFilterChange({ year: undefined })} className="hover:text-slate-900 cursor-pointer"><X size={10} /></button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

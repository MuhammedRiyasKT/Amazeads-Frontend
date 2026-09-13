// src/modules/attendance-report/components/AttendanceReportFilters.tsx

"use client";

import React from "react";
import { Filter, X, User } from "lucide-react";
import { ReportPeriod, AttendanceReportFilters, StaffOption } from "../types/attendanceReport.types";

interface AttendanceReportFiltersProps {
  period: ReportPeriod;
  filters: AttendanceReportFilters;
  onFilterChange: (updated: Partial<AttendanceReportFilters>) => void;
  onClearFilters: () => void;
  staffList: StaffOption[];
  isLoadingStaff: boolean;
}

export default function AttendanceReportFiltersBar({
  period,
  filters,
  onFilterChange,
  onClearFilters,
  staffList,
  isLoadingStaff,
}: AttendanceReportFiltersProps) {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const hasActiveFilters = Boolean(
    filters.date ||
    filters.from_date ||
    filters.to_date ||
    filters.month ||
    filters.year ||
    filters.staff_id
  );

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400" />
          <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
            Filter Report ({period.toUpperCase()})
          </span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <X size={13} />
            Reset Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Dynamic Period-specific Controls */}
        {period === "day" && (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Date
            </label>
            <input
              type="date"
              value={filters.date || ""}
              onChange={(e) => onFilterChange({ date: e.target.value || undefined })}
              className="h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors cursor-pointer text-slate-700 font-semibold"
            />
          </div>
        )}

        {period === "week" && (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                From Date
              </label>
              <input
                type="date"
                value={filters.from_date || ""}
                onChange={(e) => onFilterChange({ from_date: e.target.value || undefined })}
                className="h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors cursor-pointer text-slate-700 font-semibold"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                To Date
              </label>
              <input
                type="date"
                value={filters.to_date || ""}
                onChange={(e) => onFilterChange({ to_date: e.target.value || undefined })}
                className="h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors cursor-pointer text-slate-700 font-semibold"
              />
            </div>
          </>
        )}

        {period === "month" && (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Month
              </label>
              <select
                value={filters.month || ""}
                onChange={(e) =>
                  onFilterChange({
                    month: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors cursor-pointer text-slate-700 font-semibold"
              >
                <option value="">All Months</option>
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Year
              </label>
              <select
                value={filters.year || ""}
                onChange={(e) =>
                  onFilterChange({
                    year: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors cursor-pointer text-slate-700 font-semibold"
              >
                <option value="">All Years</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {period === "year" && (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Year
            </label>
            <select
              value={filters.year || ""}
              onChange={(e) =>
                onFilterChange({
                  year: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors cursor-pointer text-slate-700 font-semibold"
            >
              <option value="">All Years</option>
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Staff Filter Dropdown */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <User size={12} className="text-slate-400" /> Staff Member
          </label>
          <select
            value={filters.staff_id || ""}
            onChange={(e) =>
              onFilterChange({
                staff_id: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            disabled={isLoadingStaff}
            className="h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors cursor-pointer text-slate-700 font-semibold disabled:opacity-60"
          >
            <option value="">All Staff</option>
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.staff_name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

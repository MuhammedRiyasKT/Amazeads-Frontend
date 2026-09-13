// src/modules/attendance-report/components/AttendanceReportHeader.tsx

"use client";

import React from "react";
import { RefreshCw, Calendar, CalendarDays, CalendarRange, CalendarCheck } from "lucide-react";
import { ReportPeriod } from "../types/attendanceReport.types";

interface AttendanceReportHeaderProps {
  period: ReportPeriod;
  onPeriodChange: (newPeriod: ReportPeriod) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function AttendanceReportHeader({
  period,
  onPeriodChange,
  onRefresh,
  isLoading,
}: AttendanceReportHeaderProps) {
  const periods: { key: ReportPeriod; label: string; icon: React.ElementType }[] = [
    { key: "day", label: "Day", icon: Calendar },
    { key: "week", label: "Week", icon: CalendarDays },
    { key: "month", label: "Month", icon: CalendarRange },
    { key: "year", label: "Year", icon: CalendarCheck },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
      <div className="space-y-0.5">
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          Attendance Report
        </h1>
        <p className="text-xs font-semibold text-slate-400">
          {period === "month" && 'Month-by-month, most recent first · tap "View staff-wise" for the full roster'}
          {period === "week" && 'Week-by-week, most recent first · tap "View staff-wise" for the full roster'}
          {period === "day" && 'Day-by-day, most recent first · tap "View staff-wise" for the full roster'}
          {period === "year" && 'Year-by-year, most recent first · tap "View staff-wise" for the full roster'}
        </p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
        {/* Period Switcher Segmented Buttons */}
        <div className="inline-flex p-1 bg-slate-100 border border-slate-200 rounded-xl">
          {periods.map((p) => {
            const Icon = p.icon;
            const isActive = period === p.key;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => onPeriodChange(p.key)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-indigo-600 shadow-xs border border-slate-200/80"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                }`}
              >
                <Icon size={14} className={isActive ? "text-indigo-600" : "text-slate-400"} />
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Refresh button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
          title="Refresh Report Data"
        >
          <RefreshCw size={15} className={isLoading ? "animate-spin text-indigo-600" : ""} />
        </button>
      </div>
    </div>
  );
}

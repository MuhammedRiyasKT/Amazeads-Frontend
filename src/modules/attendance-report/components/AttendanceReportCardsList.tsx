// src/modules/attendance-report/components/AttendanceReportCardsList.tsx

"use client";

import React from "react";
import { AlertTriangle, RotateCcw, FileText, ArrowRight } from "lucide-react";
import { AttendanceReportItem, ReportPeriod } from "../types/attendanceReport.types";

interface AttendanceReportCardsListProps {
  items: AttendanceReportItem[];
  period: ReportPeriod;
  isLoading: boolean;
  isError: boolean;
  errorMsg?: string;
  onRetry: () => void;
  onOpenStaffModal: (item: AttendanceReportItem) => void;
}

export default function AttendanceReportCardsList({
  items,
  period,
  isLoading,
  isError,
  errorMsg,
  onRetry,
  onOpenStaffModal,
}: AttendanceReportCardsListProps) {
  // Helper to format date subtitle
  const formatDateSubtitle = (item: AttendanceReportItem) => {
    if (item.from_date && item.to_date) {
      if (item.from_date === item.to_date) {
        return formatSingleDate(item.from_date);
      }
      return `${formatSingleDate(item.from_date)} – ${formatSingleDate(item.to_date)}`;
    }
    return item.date || "";
  };

  const formatSingleDate = (str: string) => {
    try {
      const d = new Date(str);
      if (isNaN(d.getTime())) return str;
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return str;
    }
  };

  // 1. Loading Skeleton View
  if (isLoading) {
    return (
      <div className="space-y-4 w-full">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs animate-pulse space-y-4"
          >
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-5 w-40 bg-slate-100 rounded-md" />
                <div className="h-3 w-56 bg-slate-100 rounded-md" />
              </div>
              <div className="h-6 w-20 bg-slate-100 rounded-full" />
            </div>
            <div className="h-20 bg-slate-50 border border-slate-100 rounded-xl" />
            <div className="h-9 w-36 bg-slate-100 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  // 2. Error View
  if (isError) {
    return (
      <div className="bg-white border border-rose-200 rounded-2xl p-8 text-center space-y-4 shadow-2xs">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center border border-rose-100">
          <AlertTriangle size={24} />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-extrabold text-slate-800">
            Unable to load attendance report
          </h3>
          <p className="text-xs font-semibold text-slate-400 max-w-md mx-auto">
            {errorMsg || "An error occurred while connecting to the server. Please try again."}
          </p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
        >
          <RotateCcw size={14} />
          Retry
        </button>
      </div>
    );
  }

  // 3. Empty View
  if (!items || items.length === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center space-y-3 shadow-2xs">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 mx-auto flex items-center justify-center border border-slate-100">
          <FileText size={24} />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-extrabold text-slate-800">
            No attendance records found
          </h3>
          <p className="text-xs font-semibold text-slate-400">
            No attendance records found for the selected period or filters.
          </p>
        </div>
      </div>
    );
  }

  // 4. Period Cards List View
  return (
    <div className="space-y-4 w-full">
      {items.map((item, idx) => {
        const totalStaff = item.total_staffs_count ?? item.staff_reports?.length ?? 26;
        const dateSubtitle = formatDateSubtitle(item);

        return (
          <div
            key={item.id || idx}
            className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all space-y-4"
          >
            {/* Card Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  {item.name || dateSubtitle}
                </h3>
                {dateSubtitle && (
                  <p className="text-xs font-semibold text-slate-400">
                    {dateSubtitle}
                  </p>
                )}
              </div>

              {/* Staff Count Badge */}
              <span className="shrink-0 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/60">
                {totalStaff} staff
              </span>
            </div>

            {/* Stat Row Container Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 border border-slate-200/80 rounded-xl bg-white overflow-hidden text-center divide-y sm:divide-y-0 divide-x-0 sm:divide-x divide-slate-100">
              {/* Working Days */}
              <div className="p-3 flex flex-col justify-center items-center">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  WORKING DAYS
                </span>
                <span className="text-xl font-extrabold text-slate-900">
                  {item.total_working_days}
                </span>
              </div>

              {/* Present */}
              <div className="p-3 flex flex-col justify-center items-center">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  PRESENT
                </span>
                <span className="text-xl font-extrabold text-emerald-600">
                  {item.presents}
                </span>
              </div>

              {/* Absent */}
              <div className="p-3 flex flex-col justify-center items-center">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  ABSENT
                </span>
                <span className="text-xl font-extrabold text-rose-600">
                  {item.absents}
                </span>
              </div>

              {/* Leave */}
              <div className="p-3 flex flex-col justify-center items-center">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  LEAVE
                </span>
                <span className="text-xl font-extrabold text-amber-600">
                  {item.leave}
                </span>
              </div>

              {/* Holiday */}
              <div className="p-3 flex flex-col justify-center items-center">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  HOLIDAY
                </span>
                <span className="text-xl font-extrabold text-purple-600">
                  {item.holiday}
                </span>
              </div>

              {/* Half Day */}
              <div className="p-3 flex flex-col justify-center items-center">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  HALF DAY
                </span>
                <span className="text-xl font-extrabold text-sky-600">
                  {item.halfday}
                </span>
              </div>
            </div>

            {/* Bottom Action Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => onOpenStaffModal(item)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                View staff-wise &rarr;
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

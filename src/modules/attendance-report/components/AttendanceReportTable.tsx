// src/modules/attendance-report/components/AttendanceReportTable.tsx

"use client";

import React from "react";
import { AlertTriangle, RotateCcw, Calendar, FileText, ArrowRight, ChevronRight } from "lucide-react";
import { AttendanceReportItem, ReportPeriod } from "../types/attendanceReport.types";

interface AttendanceReportTableProps {
  items: AttendanceReportItem[];
  period: ReportPeriod;
  isLoading: boolean;
  isError: boolean;
  errorMsg?: string;
  onRetry: () => void;
  onOpenStaffDrawer: (item: AttendanceReportItem) => void;
}

export default function AttendanceReportTable({
  items,
  period,
  isLoading,
  isError,
  errorMsg,
  onRetry,
  onOpenStaffDrawer,
}: AttendanceReportTableProps) {
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
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
          <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between animate-pulse">
              <div className="h-5 w-44 bg-slate-100 rounded" />
              <div className="flex gap-6">
                <div className="h-4 w-12 bg-slate-100 rounded" />
                <div className="h-4 w-12 bg-slate-100 rounded" />
                <div className="h-4 w-12 bg-slate-100 rounded" />
                <div className="h-4 w-16 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
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

  // 4. Clean Data Table View
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
      <div className="overflow-x-auto w-full">
        <table className="w-full min-w-[780px] text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-5">PERIOD</th>
              <th className="py-3.5 px-4 text-center">WORKING DAYS</th>
              <th className="py-3.5 px-4 text-center">PRESENT</th>
              <th className="py-3.5 px-4 text-center">ABSENT</th>
              <th className="py-3.5 px-4 text-center">LEAVE</th>
              <th className="py-3.5 px-4 text-center">HOLIDAY</th>
              <th className="py-3.5 px-4 text-center">HALF DAY</th>
              <th className="py-3.5 px-5 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
            {items.map((item, index) => {
              const totalStaff = item.total_staffs_count ?? item.staff_reports?.length ?? 26;
              const dateSubtitle = formatDateSubtitle(item);

              return (
                <tr
                  key={item.id || index}
                  onClick={() => onOpenStaffDrawer(item)}
                  className="hover:bg-slate-50/90 transition-colors cursor-pointer group"
                >
                  {/* Period Column */}
                  <td className="py-4 px-5">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                          {item.name || dateSubtitle}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/60">
                          {totalStaff} staff
                        </span>
                      </div>
                      {dateSubtitle && (
                        <p className="text-[11px] font-medium text-slate-400">
                          {dateSubtitle}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Working Days */}
                  <td className="py-4 px-4 text-center">
                    <span className="inline-block font-extrabold text-slate-800">
                      {item.total_working_days}
                    </span>
                  </td>

                  {/* Present */}
                  <td className="py-4 px-4 text-center">
                    <span className="inline-block font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100/80">
                      {item.presents}
                    </span>
                  </td>

                  {/* Absent */}
                  <td className="py-4 px-4 text-center">
                    <span className="inline-block font-extrabold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100/80">
                      {item.absents}
                    </span>
                  </td>

                  {/* Leave */}
                  <td className="py-4 px-4 text-center">
                    <span className="inline-block font-extrabold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100/80">
                      {item.leave}
                    </span>
                  </td>

                  {/* Holiday */}
                  <td className="py-4 px-4 text-center">
                    <span className="inline-block font-extrabold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100/80">
                      {item.holiday}
                    </span>
                  </td>

                  {/* Half Day */}
                  <td className="py-4 px-4 text-center">
                    <span className="inline-block font-extrabold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100/80">
                      {item.halfday}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-4 px-5 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenStaffDrawer(item);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all cursor-pointer shadow-2xs"
                    >
                      <span>View staff-wise</span>
                      <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

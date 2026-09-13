// src/modules/attendance-report/components/AttendanceReportPagination.tsx

"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AttendancePagination } from "../types/attendanceReport.types";

interface AttendanceReportPaginationProps {
  pagination: AttendancePagination;
  onPageChange: (newPage: number) => void;
  onPageSizeChange?: (newPageSize: number) => void;
}

export default function AttendanceReportPagination({
  pagination,
  onPageChange,
  onPageSizeChange,
}: AttendanceReportPaginationProps) {
  const { page, page_size, total_count, total_pages } = pagination;

  if (total_count === 0) return null;

  const startRecord = (page - 1) * page_size + 1;
  const endRecord = Math.min(page * page_size, total_count);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
      <div className="text-xs font-semibold text-slate-500">
        Showing <span className="font-extrabold text-slate-800">{startRecord}</span> to{" "}
        <span className="font-extrabold text-slate-800">{endRecord}</span> of{" "}
        <span className="font-extrabold text-slate-800">{total_count}</span> records
      </div>

      <div className="flex items-center gap-3">
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <span>Show</span>
            <select
              value={page_size}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 text-xs font-extrabold cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-colors"
            title="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="text-xs font-extrabold text-slate-700 px-2.5">
            Page {page} of {total_pages || 1}
          </span>

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= total_pages}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-colors"
            title="Next Page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

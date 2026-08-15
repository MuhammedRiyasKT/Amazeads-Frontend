// src/modules/expenses/components/ExpensePagination.tsx

"use client";

import React from "react";
import Pagination from "@/components/ui/Pagination";

interface ExpensePaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export default function ExpensePagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
}: ExpensePaginationProps) {
  const startRange = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRange = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex items-center justify-between w-full border-t border-slate-100 pt-4 mt-2">
      {/* 1. Showing range of totals */}
      <span className="text-xs text-slate-500 font-semibold">
        Showing <strong className="text-slate-700">{startRange}–{endRange}</strong> of{" "}
        <strong className="text-slate-700">{totalCount}</strong> expenses
      </span>

      {/* 2. Page numbers controller */}
      <div>
        <Pagination
          total={totalCount}
          limit={pageSize}
          activePage={page}
          onPageChange={onPageChange}
        />
      </div>

      {/* 3. Page size selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Per Page</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
          className="h-8 px-2 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-600 cursor-pointer"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
}

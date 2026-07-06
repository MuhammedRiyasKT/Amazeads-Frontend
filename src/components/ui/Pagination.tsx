"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  total: number;
  limit: number;
  activePage: number;
  onPageChange?: (page: number) => void;
}

export default function Pagination({ total, limit, activePage, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => onPageChange?.(activePage - 1)}
        disabled={activePage === 1}
        className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
      >
        <ChevronLeft size={16} />
      </button>

      {Array.from({ length: Math.min(3, totalPages) }).map((_, i) => {
        const pageNum = i + 1;
        return (
          <button
            key={pageNum}
            type="button"
            onClick={() => onPageChange?.(pageNum)}
            className={`h-8 w-8 inline-flex items-center justify-center rounded-md text-sm font-semibold cursor-pointer transition-all ${
              activePage === pageNum
                ? "bg-slate-900 text-white font-bold"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {pageNum}
          </button>
        );
      })}

      {totalPages > 3 && <span className="px-1 text-slate-400 text-sm">...</span>}

      <button
        type="button"
        onClick={() => onPageChange?.(activePage + 1)}
        disabled={activePage === totalPages}
        className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
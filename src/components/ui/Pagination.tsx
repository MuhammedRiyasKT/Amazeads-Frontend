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

  // Helper to generate pagination items
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end range around active page
      let start = Math.max(2, activePage - 1);
      let end = Math.min(totalPages - 1, activePage + 1);
      
      // Adjust start/end to ensure we show a window of at least 3 pages if possible
      if (activePage <= 3) {
        end = 4;
      } else if (activePage >= totalPages - 2) {
        start = totalPages - 3;
      }
      
      // Left ellipsis
      if (start > 2) {
        pages.push("...");
      }
      
      // Page numbers in range
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Right ellipsis
      if (end < totalPages - 1) {
        pages.push("...");
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

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

      {getPageNumbers().map((pageNum, i) => {
        if (pageNum === "...") {
          return (
            <span key={`ellipsis-${i}`} className="w-8 h-8 inline-flex items-center justify-center text-slate-400 text-sm select-none">
              ...
            </span>
          );
        }

        return (
          <button
            key={pageNum}
            type="button"
            onClick={() => onPageChange?.(pageNum as number)}
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
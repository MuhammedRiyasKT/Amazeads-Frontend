"use client";

import React from "react";
import { Search, RotateCcw, SlidersHorizontal } from "lucide-react";

interface AccountsFiltersProps {
    searchVal: string;
    onSearchChange: (val: string) => void;
    statusFilter: string; // "all" | "active" | "inactive"
    onStatusFilterChange: (status: string) => void;
    onReset: () => void;
}

export default function AccountsFilters({
    searchVal,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    onReset,
}: AccountsFiltersProps) {
    const hasActiveFilters = searchVal.trim() !== "" || statusFilter !== "all";

    return (
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            {/* Outer row wrapper */}
            <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center justify-between">
                {/* Core Controls */}
                <div className="flex flex-col sm:flex-row flex-1 gap-3 w-full">
                    {/* Search Term */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search accounts..."
                            value={searchVal}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="h-9 w-full bg-white border border-slate-205 rounded-lg pl-9 pr-3 text-xs font-bold text-slate-800 placeholder:text-slate-450 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-sans"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 select-none">
                            Status:
                        </span>
                        <select
                            value={statusFilter}
                            onChange={(e) => onStatusFilterChange(e.target.value)}
                            className="h-9 border border-slate-205 rounded-lg px-3 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-sans"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Reset Trigger Button */}
                {hasActiveFilters && (
                    <button
                        onClick={onReset}
                        className="h-9 px-3 border border-slate-200/90 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                        <RotateCcw size={13} />
                        <span>Reset</span>
                    </button>
                )}
            </div>
        </div>
    );
}

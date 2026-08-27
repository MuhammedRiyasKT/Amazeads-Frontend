// src/modules/hr/components/DailyTasksSummary.tsx

import React, { useState, useEffect } from "react";
import { ClipboardList, AlertCircle, RefreshCw } from "lucide-react";
import { DailyTasksKpi, DailyTasksKpiParams } from "../types/kpi.types";

interface DailyTasksSummaryProps {
    kpi: DailyTasksKpi | null;
    loading: boolean;
    error: boolean;
    onFetch: (params: DailyTasksKpiParams) => void;
}

type FilterOption = "today" | "this_month" | "specific_date" | "custom_range" | "upto_today";

export default function DailyTasksSummary({
    kpi,
    loading,
    error,
    onFetch,
}: DailyTasksSummaryProps) {
    const [filter, setFilter] = useState<FilterOption>("this_month");

    // Date selection fields
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");

    useEffect(() => {
        handleApplyFilter();
    }, [filter]);

    const handleApplyFilter = () => {
        const today = new Date();
        const YYYY = today.getFullYear();
        const MM = String(today.getMonth() + 1).padStart(2, "0");
        const DD = String(today.getDate()).padStart(2, "0");

        switch (filter) {
            case "today":
                onFetch({ date: `${YYYY}-${MM}-${DD}` });
                break;
            case "this_month":
                onFetch({ month: MM, year: YYYY });
                break;
            case "upto_today":
                onFetch({ upto_today: true });
                break;
            case "specific_date":
                if (selectedDate) {
                    onFetch({ date: selectedDate });
                }
                break;
            case "custom_range":
                if (fromDate && toDate) {
                    onFetch({ from_date: fromDate, to_date: toDate });
                }
                break;
            default:
                break;
        }
    };

    const completed = kpi?.completed ?? kpi?.completed_tasks ?? 0;
    const pending = kpi?.pending ?? kpi?.pending_tasks ?? 0;
    const overdue = kpi?.overdue ?? kpi?.overdue_tasks ?? 0;
    const total = kpi?.total_tasks ?? 0;

    const completedPercent = total > 0 ? (completed / total) * 100 : 0;
    const pendingPercent = total > 0 ? (pending / total) * 100 : 0;
    const overduePercent = total > 0 ? (overdue / total) * 100 : 0;

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col h-full min-h-[360px]">
            {/* Card Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
                <h3 className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-2">
                    <ClipboardList size={16} className="text-slate-500" />
                    Daily Tasks Status
                </h3>

                {/* Dropdown Filters */}
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as FilterOption)}
                    className="text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
                >
                    <option value="today">Today</option>
                    <option value="this_month">This Month</option>
                    <option value="specific_date">Specific Date</option>
                    <option value="custom_range">Custom Range</option>
                    <option value="upto_today">Upto Today</option>
                </select>
            </div>

            {/* Date Pickers for Specific/Range Filters */}
            {(filter === "specific_date" || filter === "custom_range") && (
                <div className="py-3 px-3 bg-slate-50 border border-slate-105 rounded-lg flex items-center gap-2.5 flex-wrap mt-3 text-xs">
                    {filter === "specific_date" && (
                        <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-500">Pick Date:</span>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="border border-slate-200 text-slate-700 bg-white font-semibold rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-slate-400"
                            />
                        </div>
                    )}
                    {filter === "custom_range" && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1">
                                <span className="font-semibold text-slate-500">From:</span>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="border border-slate-200 text-slate-700 bg-white font-semibold rounded px-2 py-1 focus:outline-none"
                                />
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="font-semibold text-slate-500">To:</span>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="border border-slate-200 text-slate-700 bg-white font-semibold rounded px-2 py-1 focus:outline-none"
                                />
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleApplyFilter}
                        className="ml-auto bg-slate-805 bg-slate-800 text-white font-bold px-3 py-1 rounded hover:bg-slate-900 transition-colors shadow-2xs"
                    >
                        Apply
                    </button>
                </div>
            )}

            {/* Body Content */}
            <div className="flex-1 flex flex-col justify-center py-4">
                {loading ? (
                    <div className="space-y-4">
                        <div className="h-4 bg-slate-50 animate-pulse rounded w-1/3 mx-auto" />
                        <div className="flex justify-around items-end h-40 pt-4">
                            <div className="w-10 bg-slate-50 animate-pulse rounded-t-lg h-24" />
                            <div className="w-10 bg-slate-50 animate-pulse rounded-t-lg h-36" />
                            <div className="w-10 bg-slate-50 animate-pulse rounded-t-lg h-12" />
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center text-center py-6 text-rose-500">
                        <AlertCircle size={28} className="mb-2" />
                        <p className="text-xs font-semibold">Failed to fetch task metrics</p>
                        <button
                            onClick={handleApplyFilter}
                            className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border rounded-lg px-3 py-1.5 transition-colors"
                        >
                            <RefreshCw size={12} />
                            Retry
                        </button>
                    </div>
                ) : total === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-8 text-slate-400">
                        <ClipboardList size={28} className="mb-2 text-slate-300" />
                        <p className="text-xs font-bold">No tasks assigned in this range</p>
                    </div>
                ) : (
                    <div className="space-y-6 flex flex-col items-center">
                        {/* Consolidated stats header text */}
                        <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block text-center">
                            Total assigned: {total}
                        </span>

                        {/* Vertical Bar Graph Visual Section */}
                        <div className="flex items-end justify-center gap-10 sm:gap-14 w-full max-w-sm h-40 border-b border-slate-150 pb-2">

                            {/* Bar 1: Completed */}
                            <div className="flex flex-col items-center flex-1 h-full justify-end group">
                                <div className="w-8 sm:w-10 bg-emerald-50 rounded-t-lg h-full flex flex-col justify-end overflow-hidden border border-emerald-100 hover:bg-emerald-100/50 transition-colors">
                                    <div
                                        className="bg-emerald-500 w-full rounded-t-md transition-all duration-500"
                                        style={{ height: `${completedPercent || 4}%` }} // Min visual height of 4% if count > 0
                                        title={`Completed: ${completed} (${Math.round(completedPercent)}%)`}
                                    />
                                </div>
                                <span className="text-xs font-black text-emerald-600 mt-2">{completed}</span>
                                <span className="text-[9px] font-bold text-slate-400 group-hover:text-slate-600 mt-0.5 uppercase tracking-wide">Done</span>
                            </div>

                            {/* Bar 2: Pending */}
                            <div className="flex flex-col items-center flex-1 h-full justify-end group">
                                <div className="w-8 sm:w-10 bg-amber-50 rounded-t-lg h-full flex flex-col justify-end overflow-hidden border border-amber-100 hover:bg-amber-100/50 transition-colors">
                                    <div
                                        className="bg-amber-400 w-full rounded-t-md transition-all duration-500"
                                        style={{ height: `${pendingPercent || 4}%` }}
                                        title={`Pending: ${pending} (${Math.round(pendingPercent)}%)`}
                                    />
                                </div>
                                <span className="text-xs font-black text-amber-600 mt-2">{pending}</span>
                                <span className="text-[9px] font-bold text-slate-400 group-hover:text-slate-600 mt-0.5 uppercase tracking-wide">Pending</span>
                            </div>

                            {/* Bar 3: Overdue */}
                            <div className="flex flex-col items-center flex-1 h-full justify-end group">
                                <div className="w-8 sm:w-10 bg-rose-50 rounded-t-lg h-full flex flex-col justify-end overflow-hidden border border-rose-100 hover:bg-rose-100/50 transition-colors">
                                    <div
                                        className="bg-rose-500 w-full rounded-t-md transition-all duration-500"
                                        style={{ height: `${overduePercent || 4}%` }}
                                        title={`Overdue: ${overdue} (${Math.round(overduePercent)}%)`}
                                    />
                                </div>
                                <span className="text-xs font-black text-rose-600 mt-2">{overdue}</span>
                                <span className="text-[9px] font-bold text-slate-400 group-hover:text-slate-600 mt-0.5 uppercase tracking-wide">Overdue</span>
                            </div>

                        </div>

                        {/* Supporting Helper Info */}
                        <p className="text-[10px] text-slate-400 font-semibold text-center italic leading-normal">
                            Hover over the bars to view detailed percentage logs.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// src/modules/hr/components/AttendanceSummary.tsx

import React from "react";
import { CalendarDays, AlertCircle, RefreshCw, ChevronRight } from "lucide-react";
import Link from "next/link";

interface AttendanceSummaryProps {
    presentCount: number | null;
    absentCount: number | null;
    leaveCount: number | null;
    halfDayCount: number | null;
    loading: boolean;
    error: boolean;
    onRetry?: () => void;
}

export default function AttendanceSummary({
    presentCount,
    absentCount,
    leaveCount,
    halfDayCount,
    loading,
    error,
    onRetry,
}: AttendanceSummaryProps) {
    const pCount = presentCount ?? 0;
    const aCount = absentCount ?? 0;
    const lCount = leaveCount ?? 0;
    const hCount = halfDayCount ?? 0;

    const total = pCount + aCount + lCount + hCount;

    const presentPercent = total > 0 ? (pCount / total) * 100 : 0;
    const absentPercent = total > 0 ? (aCount / total) * 100 : 0;
    const leavePercent = total > 0 ? (lCount / total) * 100 : 0;
    const halfDayPercent = total > 0 ? (hCount / total) * 100 : 0;

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col h-full min-h-[360px]">
            {/* Card Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-2">
                    <CalendarDays size={16} className="text-slate-500" />
                    Attendance Overview
                </h3>

                <Link
                    href="/hr/attendance"
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-805 flex items-center gap-0.5 hover:underline cursor-pointer"
                >
                    Open Desk
                    <ChevronRight size={13} />
                </Link>
            </div>

            {/* Body Content */}
            <div className="flex-1 flex flex-col justify-center py-4">
                {loading ? (
                    <div className="space-y-4">
                        <div className="h-4 bg-slate-50 animate-pulse rounded w-1/3 mx-auto" />
                        <div className="flex justify-around items-end h-40 pt-4">
                            <div className="w-8 bg-slate-50 animate-pulse rounded-t-lg h-36" />
                            <div className="w-8 bg-slate-50 animate-pulse rounded-t-lg h-12" />
                            <div className="w-8 bg-slate-50 animate-pulse rounded-t-lg h-24" />
                            <div className="w-8 bg-slate-50 animate-pulse rounded-t-lg h-8" />
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center text-center py-6 text-rose-505">
                        <AlertCircle size={28} className="mb-2 text-rose-500" />
                        <p className="text-xs font-semibold text-rose-500">Failed to fetch attendance summary</p>
                        <button
                            onClick={onRetry}
                            className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border rounded-lg px-3 py-1.5 transition-colors"
                        >
                            <RefreshCw size={12} />
                            Retry
                        </button>
                    </div>
                ) : total === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-8 text-slate-400">
                        <CalendarDays size={28} className="mb-2 text-slate-300" />
                        <p className="text-xs font-bold">No attendance logs found for today</p>
                    </div>
                ) : (
                    <div className="space-y-6 flex flex-col items-center">
                        {/* Consolidated stats header text */}
                        <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block text-center">
                            Total staff: {total}
                        </span>

                        {/* Vertical Bar Graph Visual Section */}
                        <div className="flex items-end justify-center gap-6 sm:gap-8 w-full max-w-sm h-40 border-b border-slate-150 pb-2">

                            {/* Bar 1: Present */}
                            <div className="flex flex-col items-center flex-1 h-full justify-end group">
                                <div className="w-7 sm:w-8 bg-emerald-50 rounded-t-lg h-full flex flex-col justify-end overflow-hidden border border-emerald-100 hover:bg-emerald-100/50 transition-colors">
                                    <div
                                        className="bg-emerald-500 w-full rounded-t-md transition-all duration-500"
                                        style={{ height: `${presentPercent || 4}%` }}
                                        title={`Present: ${pCount} (${Math.round(presentPercent)}%)`}
                                    />
                                </div>
                                <span className="text-xs font-black text-emerald-600 mt-2">{pCount}</span>
                                <span className="text-[9px] font-bold text-slate-400 group-hover:text-slate-600 mt-0.5 uppercase tracking-wide">Present</span>
                            </div>

                            {/* Bar 2: Absent */}
                            <div className="flex flex-col items-center flex-1 h-full justify-end group">
                                <div className="w-7 sm:w-8 bg-rose-50 rounded-t-lg h-full flex flex-col justify-end overflow-hidden border border-rose-100 hover:bg-rose-100/50 transition-colors">
                                    <div
                                        className="bg-rose-500 w-full rounded-t-md transition-all duration-500"
                                        style={{ height: `${absentPercent || 4}%` }}
                                        title={`Absent: ${aCount} (${Math.round(absentPercent)}%)`}
                                    />
                                </div>
                                <span className="text-xs font-black text-rose-600 mt-2">{aCount}</span>
                                <span className="text-[9px] font-bold text-slate-400 group-hover:text-slate-600 mt-0.5 uppercase tracking-wide">Absent</span>
                            </div>

                            {/* Bar 3: On Leave */}
                            <div className="flex flex-col items-center flex-1 h-full justify-end group">
                                <div className="w-7 sm:w-8 bg-amber-50 rounded-t-lg h-full flex flex-col justify-end overflow-hidden border border-amber-100 hover:bg-amber-100/50 transition-colors">
                                    <div
                                        className="bg-amber-450 bg-amber-400 w-full rounded-t-md transition-all duration-500"
                                        style={{ height: `${leavePercent || 4}%` }}
                                        title={`On Leave: ${lCount} (${Math.round(leavePercent)}%)`}
                                    />
                                </div>
                                <span className="text-xs font-black text-amber-600 mt-2">{lCount}</span>
                                <span className="text-[9px] font-bold text-slate-400 group-hover:text-slate-600 mt-0.5 uppercase tracking-wide">Leave</span>
                            </div>

                            {/* Bar 4: Half Day */}
                            <div className="flex flex-col items-center flex-1 h-full justify-end group">
                                <div className="w-7 sm:w-8 bg-blue-50 rounded-t-lg h-full flex flex-col justify-end overflow-hidden border border-blue-100 hover:bg-blue-100/50 transition-colors">
                                    <div
                                        className="bg-blue-500 w-full rounded-t-md transition-all duration-500"
                                        style={{ height: `${halfDayPercent || 4}%` }}
                                        title={`Half Day: ${hCount} (${Math.round(halfDayPercent)}%)`}
                                    />
                                </div>
                                <span className="text-xs font-black text-blue-600 mt-2">{hCount}</span>
                                <span className="text-[9px] font-bold text-slate-400 group-hover:text-slate-600 mt-0.5 uppercase tracking-wide">Half</span>
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

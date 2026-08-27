// src/modules/hr/components/HROverviewKpiCards.tsx

import React from "react";
import { Users, UserX, CalendarDays, ClipboardList, AlertCircle, RefreshCw } from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";

interface HROverviewKpiCardsProps {
    presentCount: number | null;
    absentCount: number | null;
    pendingLeavesCount: number | null;
    totalTasksCount: number | null;
    loadingAttendance: boolean;
    loadingLeaves: boolean;
    loadingTasks: boolean;
    errorAttendance: boolean;
    errorLeaves: boolean;
    errorTasks: boolean;
    onRetryAttendance?: () => void;
    onRetryLeaves?: () => void;
    onRetryTasks?: () => void;
}

export default function HROverviewKpiCards({
    presentCount,
    absentCount,
    pendingLeavesCount,
    totalTasksCount,
    loadingAttendance,
    loadingLeaves,
    loadingTasks,
    errorAttendance,
    errorLeaves,
    errorTasks,
    onRetryAttendance,
    onRetryLeaves,
    onRetryTasks,
}: HROverviewKpiCardsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Today's Present */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:shadow-xs transition-shadow flex items-center justify-between">
                <div className="space-y-1.5 flex-1 min-w-0 pr-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Present Today</span>
                    {loadingAttendance ? (
                        <div className="h-7 w-20 bg-slate-100 animate-pulse rounded" />
                    ) : errorAttendance ? (
                        <div className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold">
                            <AlertCircle size={14} />
                            <span>Failed</span>
                            <button
                                onClick={onRetryAttendance}
                                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                                title="Retry"
                            >
                                <RefreshCw size={11} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-baseline gap-1.5">
                            <strong className="text-2xl font-bold text-slate-800">{presentCount ?? 0}</strong>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">At Work</span>
                        </div>
                    )}
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100/50 shrink-0">
                    <Users size={20} />
                </div>
            </div>

            {/* 2. Today's Absent */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:shadow-xs transition-shadow flex items-center justify-between">
                <div className="space-y-1.5 flex-1 min-w-0 pr-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Absent Today</span>
                    {loadingAttendance ? (
                        <div className="h-7 w-20 bg-slate-100 animate-pulse rounded" />
                    ) : errorAttendance ? (
                        <div className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold">
                            <AlertCircle size={14} />
                            <span>Failed</span>
                            <button
                                onClick={onRetryAttendance}
                                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                                title="Retry"
                            >
                                <RefreshCw size={11} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-baseline gap-1.5">
                            <strong className="text-2xl font-bold text-slate-800">{absentCount ?? 0}</strong>
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">Away</span>
                        </div>
                    )}
                </div>
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100/50 shrink-0">
                    <UserX size={20} />
                </div>
            </div>

            {/* 3. Pending Leaves requests */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:shadow-xs transition-shadow flex items-center justify-between">
                <div className="space-y-1.5 flex-1 min-w-0 pr-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Leaves</span>
                    {loadingLeaves ? (
                        <div className="h-7 w-20 bg-slate-100 animate-pulse rounded" />
                    ) : errorLeaves ? (
                        <div className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold">
                            <AlertCircle size={14} />
                            <span>Failed</span>
                            <button
                                onClick={onRetryLeaves}
                                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                                title="Retry"
                            >
                                <RefreshCw size={11} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-baseline gap-1.5">
                            <strong className="text-2xl font-bold text-slate-800">{pendingLeavesCount ?? 0}</strong>
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">Review</span>
                        </div>
                    )}
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100/50 shrink-0">
                    <CalendarDays size={20} />
                </div>
            </div>

            {/* 4. Daily Tasks */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:shadow-xs transition-shadow flex items-center justify-between">
                <div className="space-y-1.5 flex-1 min-w-0 pr-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Daily Tasks</span>
                    {loadingTasks ? (
                        <div className="h-7 w-20 bg-slate-100 animate-pulse rounded" />
                    ) : errorTasks ? (
                        <div className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold">
                            <AlertCircle size={14} />
                            <span>Failed</span>
                            <button
                                onClick={onRetryTasks}
                                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                                title="Retry"
                            >
                                <RefreshCw size={11} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-baseline gap-1.5">
                            <strong className="text-2xl font-bold text-slate-800">{totalTasksCount ?? 0}</strong>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">Total</span>
                        </div>
                    )}
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100/50 shrink-0">
                    <ClipboardList size={20} />
                </div>
            </div>
        </div>
    );
}

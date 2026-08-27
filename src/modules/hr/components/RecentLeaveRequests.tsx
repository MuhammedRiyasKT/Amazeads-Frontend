// src/modules/hr/components/RecentLeaveRequests.tsx

import React from "react";
import { Users, Eye, AlertCircle, RefreshCw, ChevronRight } from "lucide-react";
import Link from "next/link";
import { LeaveRequest, LeaveStatus } from "@/modules/leave/types";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";

interface RecentLeaveRequestsProps {
    leaves: LeaveRequest[];
    loading: boolean;
    error: boolean;
    onRetry?: () => void;
    onViewLeave?: (leave: LeaveRequest) => void;
}

export default function RecentLeaveRequests({
    leaves,
    loading,
    error,
    onRetry,
    onViewLeave,
}: RecentLeaveRequestsProps) {
    const getStatusBadgeClass = (status: LeaveStatus) => {
        switch (status) {
            case "Pending":
            case "Manager Approved":
            case "HR Approved":
                return "bg-amber-50 text-amber-700 border-amber-200";
            case "Approved":
                return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "Rejected":
                return "bg-rose-50 text-rose-700 border-rose-200";
            default:
                return "bg-slate-50 text-slate-600 border-slate-205";
        }
    };

    const getLeaveTypeBadgeClass = (type: string) => {
        switch (type) {
            case "Casual":
                return "bg-indigo-50 text-indigo-700 border-indigo-100";
            case "Sick":
                return "bg-rose-50 text-rose-700 border-rose-105";
            case "Paid":
                return "bg-teal-50 text-teal-700 border-teal-100";
            case "Unpaid":
            default:
                return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    const formatDateReadable = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col h-full">
            {/* Card Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-2">
                    <Users size={16} className="text-slate-505" />
                    Recent Leave Requests
                </h3>

                <Link
                    href="/hr/leave"
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 hover:underline cursor-pointer"
                >
                    View All
                    <ChevronRight size={13} />
                </Link>
            </div>

            {/* Body Content */}
            <div className="flex-1 flex flex-col justify-center py-2 overflow-x-auto w-full">
                {loading ? (
                    <div className="space-y-4 py-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex justify-between items-center py-1">
                                <div className="h-5 bg-slate-55 animate-pulse rounded w-1/3" />
                                <div className="h-4 bg-slate-50 animate-pulse rounded w-1/4" />
                                <div className="h-5 bg-slate-50 animate-pulse rounded w-16" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center text-center py-6 text-rose-500">
                        <AlertCircle size={28} className="mb-2" />
                        <p className="text-xs font-semibold">Failed to fetch leave requests</p>
                        <button
                            onClick={onRetry}
                            className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border rounded-lg px-3 py-1.5 transition-colors"
                        >
                            <RefreshCw size={12} />
                            Retry
                        </button>
                    </div>
                ) : leaves.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-8 text-slate-400">
                        <Users size={28} className="mb-2 text-slate-300" />
                        <p className="text-xs font-bold">No leave applications</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto w-full min-w-[360px]">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                                    <th className="py-2.5">Staff</th>
                                    <th className="py-2.5">Type</th>
                                    <th className="py-2.5">Dates</th>
                                    <th className="py-2.5 text-center">Status</th>
                                    {onViewLeave && <th className="py-2.5 text-center">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {leaves.map((leave) => {
                                    const displayStatus =
                                        leave.status === "Manager Approved" ||
                                            leave.status === "HR Approved"
                                            ? "Pending"
                                            : leave.status;

                                    return (
                                        <tr key={leave.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-2.5 pr-2 font-bold text-slate-800">
                                                {leave.staff_name || `Staff #${leave.staff_id}`}
                                            </td>
                                            <td className="py-2.5 pr-2">
                                                <span className={`px-2 py-0.5 text-[10px] font-medium rounded border ${getLeaveTypeBadgeClass(leave.leave_type)}`}>
                                                    {leave.leave_type}
                                                </span>
                                            </td>
                                            <td className="py-2.5 pr-2 text-[10px] font-semibold text-slate-600">
                                                {formatDateReadable(leave.from_date)} - {formatDateReadable(leave.to_date)}
                                            </td>
                                            <td className="py-2.5 text-center">
                                                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-lg border uppercase tracking-wider ${getStatusBadgeClass(leave.status)}`}>
                                                    {displayStatus}
                                                </span>
                                            </td>
                                            {onViewLeave && (
                                                <td className="py-2.5 text-center">
                                                    <button
                                                        onClick={() => onViewLeave(leave)}
                                                        className="p-1 hover:bg-slate-100 text-indigo-600 hover:text-indigo-805 rounded transition-all cursor-pointer"
                                                        title="View Reason"
                                                    >
                                                        <Eye size={13} />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

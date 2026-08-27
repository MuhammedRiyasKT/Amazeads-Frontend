// src/modules/hr/components/UpcomingHolidays.tsx

import React from "react";
import { Calendar, AlertCircle, RefreshCw, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Holiday } from "@/modules/hr/types/attendance.types";

interface UpcomingHolidaysProps {
    holidays: Holiday[];
    loading: boolean;
    error: boolean;
    onRetry?: () => void;
}

export default function UpcomingHolidays({
    holidays,
    loading,
    error,
    onRetry,
}: UpcomingHolidaysProps) {

    const formatDateReadable = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    const getUpcomingHolidaysOnly = (items: Holiday[]) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return items
            .filter((h) => {
                const hDate = new Date(h.holiday_date);
                hDate.setHours(0, 0, 0, 0);
                return hDate >= today;
            })
            .sort((a, b) => new Date(a.holiday_date).getTime() - new Date(b.holiday_date).getTime())
            .slice(0, 4); // Show maximum 4 items
    };

    const upcomingHolidays = getUpcomingHolidaysOnly(holidays || []);

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col h-full">
            {/* Card Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-2">
                    <Calendar size={16} className="text-slate-505" />
                    Upcoming Holidays
                </h3>

                <Link
                    href="/hr/attendance"
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-805 flex items-center gap-0.5 hover:underline cursor-pointer"
                >
                    Manage
                    <ChevronRight size={13} />
                </Link>
            </div>

            {/* Body Content */}
            <div className="flex-1 flex flex-col justify-center py-4">
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex gap-3 py-1">
                                <div className="h-9 w-12 bg-slate-50 animate-pulse rounded" />
                                <div className="flex-1 space-y-1.5">
                                    <div className="h-4 bg-slate-50 animate-pulse rounded w-2/3" />
                                    <div className="h-3 bg-slate-50 animate-pulse rounded w-1/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center text-center py-6 text-rose-505">
                        <AlertCircle size={28} className="mb-2 text-rose-500" />
                        <p className="text-xs font-semibold text-rose-500">Failed to fetch holidays</p>
                        <button
                            onClick={onRetry}
                            className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border rounded-lg px-3 py-1.5 transition-colors"
                        >
                            <RefreshCw size={12} />
                            Retry
                        </button>
                    </div>
                ) : upcomingHolidays.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-8 text-slate-400">
                        <Calendar size={28} className="mb-2 text-slate-300" />
                        <p className="text-xs font-bold">No upcoming holidays scheduled</p>
                    </div>
                ) : (
                    <div className="space-y-3.5">
                        {upcomingHolidays.map((holiday) => {
                            const hDate = new Date(holiday.holiday_date);
                            const dayNum = String(hDate.getDate()).padStart(2, "0");
                            const monthStr = hDate.toLocaleDateString("en-IN", { month: "short" }).toUpperCase();

                            return (
                                <div key={holiday.id || holiday.holiday_date} className="flex items-center gap-3.5 group">
                                    {/* Calendar Icon Indicator */}
                                    <div className="flex flex-col items-center justify-center text-center w-11 h-11 bg-slate-50 rounded-lg border border-slate-150 group-hover:bg-indigo-50/20 group-hover:border-indigo-100 transition-colors shrink-0">
                                        <span className="text-[9px] font-bold text-slate-400 leading-none block">{monthStr}</span>
                                        <span className="text-base font-extrabold text-slate-700 leading-tight block">{dayNum}</span>
                                    </div>

                                    {/* Holiday Title Info */}
                                    <div className="flex-1 min-w-0">
                                        <span className="font-bold text-slate-800 text-xs truncate block">
                                            {holiday.holiday_name}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-semibold block">
                                            {formatDateReadable(holiday.holiday_date)}
                                        </span>
                                    </div>

                                    {/* Optional Status Badge */}
                                    <div className="shrink-0">
                                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border tracking-wide uppercase ${holiday.is_optional
                                                ? "bg-slate-50 text-slate-550 border-slate-200"
                                                : "bg-indigo-50 text-indigo-700 border-indigo-200"
                                            }`}>
                                            {holiday.is_optional ? "Optional" : "Mandatory"}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

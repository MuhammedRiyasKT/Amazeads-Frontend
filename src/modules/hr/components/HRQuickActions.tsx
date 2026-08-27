// src/modules/hr/components/HRQuickActions.tsx

import React from "react";
import { CalendarDays, CalendarCheck, ClipboardList, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function HRQuickActions() {
    const actions = [
        {
            name: "Attendance Desk",
            description: "Manage check-ins, check-outs and daily logs",
            path: "/hr/attendance",
            icon: CalendarDays,
            colorClass: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100/50 hover:border-emerald-200 border-emerald-100",
        },
        {
            name: "Leave Desk",
            description: "Approve, reject and audit staff leave requests",
            path: "/hr/leave",
            icon: CalendarCheck,
            colorClass: "bg-amber-50 text-amber-600 hover:bg-amber-100/50 hover:border-amber-200 border-amber-100",
        },
        {
            name: "Daily Tasks",
            description: "Track staff task assignment logs and completions",
            path: "/hr/daily-tasks",
            icon: ClipboardList,
            colorClass: "bg-blue-50 text-blue-600 hover:bg-blue-100/50 hover:border-blue-200 border-blue-100",
        },
        {
            name: "Holiday Calendar",
            description: "Schedule company holidays and optional leaves",
            path: "/hr/attendance",
            icon: Calendar,
            colorClass: "bg-purple-50 text-purple-600 hover:bg-purple-100/50 hover:border-purple-200 border-purple-105",
        },
    ];

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col h-full">
            {/* Card Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-2">
                    <ClipboardList size={16} className="text-slate-505" />
                    Quick Actions
                </h3>
            </div>

            {/* Grid of Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                {actions.map((act) => {
                    const Icon = act.icon;
                    return (
                        <Link
                            key={act.name}
                            href={act.path}
                            className={`flex items-start gap-3.5 p-4 rounded-xl border transition-all cursor-pointer group shadow-2xs ${act.colorClass}`}
                        >
                            <div className="p-2.5 bg-white/80 rounded-lg shrink-0 border border-white">
                                <Icon size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-850 text-xs flex items-center gap-1 group-hover:text-slate-800">
                                    {act.name}
                                    <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0 transition-all text-slate-400" />
                                </h4>
                                <p className="text-[10px] text-slate-400 font-semibold mt-1 leading-normal">
                                    {act.description}
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

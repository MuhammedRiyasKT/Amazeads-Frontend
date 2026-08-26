"use client";

import React from "react";
import { ListTodo, Clock, Activity, CheckCircle2, AlertTriangle } from "lucide-react";
import { ComplianceKpi } from "../types/compliances.types";

interface ComplianceKpiCardsProps {
    kpi: ComplianceKpi | null;
    isLoading: boolean;
}

export default function ComplianceKpiCards({ kpi, isLoading }: ComplianceKpiCardsProps) {
    // If loading and no kpi, show skeletons
    const cards = [
        {
            title: "Total Compliances",
            value: kpi?.total_compliances ?? 0,
            icon: ListTodo,
            colorClass: "text-slate-700 bg-slate-100",
            borderClass: "border-slate-200",
        },
        {
            title: "Pending",
            value: kpi?.pending_compliances ?? 0,
            icon: Clock,
            colorClass: "text-amber-600 bg-amber-50",
            borderClass: "border-amber-200",
        },
        {
            title: "In Progress",
            value: kpi?.in_progress_compliances ?? 0,
            icon: Activity,
            colorClass: "text-blue-600 bg-blue-50",
            borderClass: "border-blue-200",
        },
        {
            title: "Completed",
            value: kpi?.completed_compliances ?? 0,
            icon: CheckCircle2,
            colorClass: "text-emerald-600 bg-emerald-50",
            borderClass: "border-emerald-250",
        },
        {
            title: "Overdue",
            value: kpi?.overdue_compliances ?? 0,
            icon: AlertTriangle,
            colorClass: kpi?.overdue_compliances && kpi.overdue_compliances > 0 ? "text-rose-600 bg-rose-50 animate-pulse" : "text-rose-600 bg-rose-50",
            borderClass: kpi?.overdue_compliances && kpi.overdue_compliances > 0 ? "border-rose-300" : "border-rose-200",
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full">
            {cards.map((card, idx) => {
                const Icon = card.icon;
                return (
                    <div
                        key={idx}
                        className={`bg-white p-5 rounded-xl border ${card.borderClass} shadow-2xs flex items-center justify-between transition-all hover:shadow-xs ${idx === 4 ? "col-span-2 md:col-span-1" : ""
                            }`}
                    >
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
                                {card.title}
                            </span>
                            {isLoading ? (
                                <div className="h-7 w-12 bg-slate-100 animate-pulse rounded-md" />
                            ) : (
                                <span className="text-2xl font-black text-slate-900 leading-none">
                                    {card.value}
                                </span>
                            )}
                        </div>
                        <div className={`p-2.5 rounded-lg ${card.colorClass}`}>
                            <Icon size={20} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

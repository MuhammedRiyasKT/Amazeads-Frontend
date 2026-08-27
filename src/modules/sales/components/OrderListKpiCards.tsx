// src/modules/sales/components/OrderListKpiCards.tsx

import React from "react";
import {
    ShoppingCart,
    Sparkles,
    Activity,
    Truck,
    CheckCircle2,
    AlertCircle,
    RefreshCw
} from "lucide-react";
import { SalesOrderStatusData } from "../types";

interface OrderListKpiCardsProps {
    data: SalesOrderStatusData | null;
    loading: boolean;
    error: boolean;
    onRetry?: () => void;
}

export default function OrderListKpiCards({
    data,
    loading,
    error,
    onRetry,
}: OrderListKpiCardsProps) {
    // Extract values with safe fallback options
    const total = data?.total_orders ?? 0;
    const newOrders = data?.new_orders ?? 0;
    const inProgress = data?.in_progress ?? data?.ongoing_orders ?? 0;
    const inTransit = data?.in_transit ?? data?.in_transist ?? 0;
    const delivered = data?.delivered ?? data?.closed_orders ?? data?.closed ?? 0;

    const kpis = [
        {
            label: "Total Orders",
            value: total,
            description: "Received to date",
            icon: ShoppingCart,
            colorClass: "bg-indigo-50 text-indigo-600 border-indigo-100",
        },
        {
            label: "New Orders",
            value: newOrders,
            description: "Awaiting production",
            icon: Sparkles,
            colorClass: "bg-blue-50 text-blue-600 border-blue-100",
        },
        {
            label: "In Progress",
            value: inProgress,
            description: "Active in workshop",
            icon: Activity,
            colorClass: "bg-amber-50 text-amber-600 border-amber-100",
        },
        {
            label: "In Transit",
            value: inTransit,
            description: "Dispatched & shipping",
            icon: Truck,
            colorClass: "bg-purple-50 text-purple-650 border-purple-100",
        },
        {
            label: "Delivered",
            value: delivered,
            description: "Completed handovers",
            icon: CheckCircle2,
            colorClass: "bg-emerald-50 text-emerald-600 border-emerald-100",
        },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-5">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-white border border-slate-205 rounded-xl p-4 flex justify-between items-center animate-pulse"
                    >
                        <div className="space-y-2 flex-grow min-w-0 pr-2">
                            <div className="h-3 bg-slate-100 rounded-sm w-3/4" />
                            <div className="h-6 bg-slate-100 rounded-md w-1/2" />
                            <div className="h-2.5 bg-slate-100 rounded-sm w-5/6" />
                        </div>
                        <div className="h-9 w-9 bg-slate-50 rounded-lg shrink-0" />
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white border border-rose-150 rounded-xl p-6 mb-5 shadow-3xs flex flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-50 rounded-full border border-rose-100 text-rose-500 shrink-0">
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-slate-800">Failed to load order pipeline KPIs</h4>
                        <p className="text-[10px] text-slate-450 font-semibold mt-0.5">Please check network connection or reload.</p>
                    </div>
                </div>
                <button
                    onClick={onRetry}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border rounded-lg px-3 py-1.5 transition-colors cursor-pointer select-none"
                >
                    <RefreshCw size={12} />
                    Retry Load
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-5">
            {kpis.map((kpi) => {
                const Icon = kpi.icon;
                return (
                    <div
                        key={kpi.label}
                        className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center shadow-3xs hover:translate-y-[-1px] hover:shadow-2xs transition-all"
                    >
                        <div className="flex-1 min-w-0">
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                                {kpi.label}
                            </span>
                            <h2 className="text-xl font-extrabold text-slate-800 leading-tight">
                                {kpi.value.toLocaleString()}
                            </h2>
                            <span className="text-[9.5px] font-bold text-slate-400 mt-0.5 block">
                                {kpi.description}
                            </span>
                        </div>
                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border ${kpi.colorClass}`}>
                            <Icon size={16} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

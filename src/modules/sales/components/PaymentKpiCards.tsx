// src/modules/sales/components/PaymentKpiCards.tsx

import React from "react";
import {
    Wallet,
    CheckCircle,
    RefreshCw,
    IndianRupee,
    AlertTriangle,
    AlertCircle
} from "lucide-react";
import { SalesPaymentStatusData } from "../types";

interface PaymentKpiCardsProps {
    data: SalesPaymentStatusData | null;
    loading: boolean;
    error: boolean;
    onRetry?: () => void;
}

export default function PaymentKpiCards({
    data,
    loading,
    error,
    onRetry,
}: PaymentKpiCardsProps) {
    // Extract values with safe fallback options
    const total = data?.total_orders ?? 0;
    const paid = data?.paid_orders ?? data?.paid ?? 0;
    const partial = data?.partial_orders ?? data?.partial ?? 0;
    const pending = data?.balance_pending_orders ?? 0;
    const notPaid = data?.not_paid_orders ?? data?.not_paid ?? 0;

    const kpis = [
        {
            label: "Total Orders",
            value: total,
            description: "Total invoice register",
            icon: Wallet,
            colorClass: "bg-indigo-50 text-indigo-600 border-indigo-100",
        },
        {
            label: "Paid Orders",
            value: paid,
            description: "Fully recovered sales",
            icon: CheckCircle,
            colorClass: "bg-emerald-50 text-emerald-600 border-emerald-100",
        },
        {
            label: "Partial Payments",
            value: partial,
            description: "Advance collected",
            icon: RefreshCw,
            colorClass: "bg-blue-50 text-blue-600 border-blue-100",
        },
        {
            label: "Balance Pending",
            value: pending,
            description: "Awaiting final settlement",
            icon: IndianRupee,
            colorClass: "bg-amber-50 text-amber-600 border-amber-100",
        },
        {
            label: "Not Paid",
            value: notPaid,
            description: "Zero collections received",
            icon: AlertTriangle,
            colorClass: "bg-rose-50 text-rose-600 border-rose-100",
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
                        <h4 className="text-xs font-bold text-slate-800">Failed to load payment state KPIs</h4>
                        <p className="text-[10px] text-slate-450 font-semibold mt-0.5">Please check network connection or reload.</p>
                    </div>
                </div>
                <button
                    onClick={onRetry}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-105 hover:bg-slate-200 border rounded-lg px-3 py-1.5 transition-colors cursor-pointer select-none"
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

"use client";

import React from "react";
import { Eye, ShieldCheck, ShieldAlert, ArrowRight } from "lucide-react";
import { ExpenseAccount } from "../types/accounts.types";

interface AccountMobileCardProps {
    acc: ExpenseAccount;
    onView: (acc: ExpenseAccount) => void;
}

export default function AccountMobileCard({ acc, onView }: AccountMobileCardProps) {
    const formatDateReadable = (dateStr?: string) => {
        if (!dateStr) return "—";
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="bg-white p-4.5 rounded-xl border border-slate-250/90 shadow-2xs space-y-3 relative hover:shadow-xs transition-shadow flex flex-col font-sans">
            {/* Top row */}
            <div className="flex justify-between items-start gap-2">
                <h4 className="font-black text-slate-805 text-base truncate max-w-[200px]">
                    {acc.account_name}
                </h4>
                <div>
                    {acc.status ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-extrabold rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                            <ShieldCheck size={9} />
                            <span>Active</span>
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-extrabold rounded-full border bg-slate-50 text-slate-650 border-slate-200">
                            <ShieldAlert size={9} />
                            <span>Inactive</span>
                        </span>
                    )}
                </div>
            </div>

            {/* Timing Info */}
            <div className="grid grid-cols-2 gap-2 text-xs border-y border-slate-100 py-2.5">
                <div>
                    <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">
                        Created
                    </span>
                    <span className="font-bold text-slate-700 block">
                        {formatDateReadable(acc.created_on)}
                    </span>
                </div>
                <div>
                    <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">
                        Updated
                    </span>
                    <span className="font-bold text-slate-700 block">
                        {formatDateReadable(acc.updated_on)}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <button
                onClick={() => onView(acc)}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
                <span>View Details</span>
                <ArrowRight size={13} className="text-slate-500" />
            </button>
        </div>
    );
}

"use client";

import React from "react";
import { X, Calendar, User, Info, CheckCircle, ShieldCheck, ShieldAlert } from "lucide-react";
import { ExpenseAccount } from "../types/accounts.types";

interface AccountDetailsDrawerProps {
    account: ExpenseAccount | null;
    onClose: () => void;
}

export default function AccountDetailsDrawer({
    account,
    onClose,
}: AccountDetailsDrawerProps) {
    if (!account) return null;

    const formatDateReadable = (dateStr?: string) => {
        if (!dateStr) return "—";
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString("en-US", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }).replace(/,.*$/, ""); // Pretty simple format
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end font-sans">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity cursor-pointer animate-fadeIn"
                onClick={onClose}
            />

            {/* Slide-in Overlay Panel */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-slideLeft">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                            Account Overview
                        </span>
                        <h3 className="text-base font-black text-slate-900 truncate max-w-[280px]">
                            {account.account_name}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 px-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 rounded-lg transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Status highlight */}
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Account Status
                        </span>
                        {account.status ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                                <ShieldCheck size={12} />
                                <span>Active</span>
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-full border bg-slate-50 text-slate-600 border-slate-205">
                                <ShieldAlert size={12} />
                                <span>Inactive</span>
                            </span>
                        )}
                    </div>

                    {/* Timing details */}
                    <div className="space-y-3.5">
                        <h4 className="text-xs font-black text-slate-805 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-1.5">
                            <Calendar size={14} className="text-slate-500" />
                            Dates & History
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase block">Created On</span>
                                <span className="text-xs font-semibold text-slate-705 block pt-0.5">
                                    {formatDateReadable(account.created_on)}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase block">Last Updated</span>
                                <span className="text-xs font-semibold text-slate-705 block pt-0.5">
                                    {formatDateReadable(account.updated_on)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Audit Logs / Tech Specs */}
                    <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-black text-slate-450 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-1.5">
                            System Audit Metadata
                        </h4>
                        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-150/70 space-y-3 text-xs">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 font-semibold">Account ID</span>
                                <span className="font-extrabold text-slate-800">#{account.id}</span>
                            </div>
                            {account.created_by_id !== undefined && (
                                <div className="flex justify-between items-center text-slate-600">
                                    <span className="text-slate-400 font-medium">Created By ID</span>
                                    <span className="font-bold">User #{account.created_by_id}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-slate-600">
                                <span className="text-slate-400 font-medium">Delete Status</span>
                                <span className="font-bold">
                                    {account.delete_status ? "Deleted" : "Normal (Active record)"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

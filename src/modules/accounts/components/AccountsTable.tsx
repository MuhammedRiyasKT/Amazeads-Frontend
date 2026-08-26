"use client";

import React from "react";
import { Eye, ShieldCheck, ShieldAlert } from "lucide-react";
import { ExpenseAccount } from "../types/accounts.types";

interface AccountsTableProps {
    accounts: ExpenseAccount[];
    onView: (acc: ExpenseAccount) => void;
}

export default function AccountsTable({ accounts, onView }: AccountsTableProps) {
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden w-full font-sans">
            <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs border-collapse">
                    <thead>
                        <tr className="bg-slate-100/80 border-b border-slate-101 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                            <th className="py-3 px-4 border-r border-slate-100">Account</th>
                            <th className="py-3 px-4 border-r border-slate-100 w-36 text-center">Status</th>
                            <th className="py-3 px-4 border-r border-slate-100">Created</th>
                            <th className="py-3 px-4 border-r border-slate-100">Last Updated</th>
                            <th className="py-3 px-4 text-center w-28">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {accounts.map((acc) => (
                            <tr key={acc.id} className="transition-colors hover:bg-slate-50/70">
                                {/* Account Name */}
                                <td className="py-3.5 px-4 border-r border-slate-100 font-bold text-slate-800 text-sm">
                                    {acc.account_name}
                                </td>

                                {/* Status Badge */}
                                <td className="py-3.5 px-4 border-r border-slate-100 text-center">
                                    {acc.status ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                                            <ShieldCheck size={10} />
                                            <span>Active</span>
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full border bg-slate-50 text-slate-600 border-slate-200">
                                            <ShieldAlert size={10} />
                                            <span>Inactive</span>
                                        </span>
                                    )}
                                </td>

                                {/* Created On */}
                                <td className="py-3.5 px-4 border-r border-slate-100 font-semibold text-slate-700">
                                    {formatDateReadable(acc.created_on)}
                                </td>

                                {/* Updated On */}
                                <td className="py-3.5 px-4 border-r border-slate-100 font-medium text-slate-500">
                                    {formatDateReadable(acc.updated_on)}
                                </td>

                                {/* Actions button */}
                                <td className="py-3.5 px-4 text-center">
                                    <button
                                        onClick={() => onView(acc)}
                                        className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[10px] font-bold inline-flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                        title="View Account Details"
                                    >
                                        <Eye size={12} className="text-slate-500" />
                                        <span>View</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { Compliance } from "../types/compliances.types";

interface ComplianceStatusDialogProps {
    compliance: Compliance;
    onClose: () => void;
    onConfirm: (payload: { status: string; remarks: string }) => Promise<void>;
}

export default function ComplianceStatusDialog({
    compliance,
    onClose,
    onConfirm,
}: ComplianceStatusDialogProps) {
    const [status, setStatus] = useState("Pending");
    const [remarks, setRemarks] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (compliance) {
            setStatus(compliance.status || "Pending");
            setRemarks(compliance.remarks || "");
        }
        setError("");
    }, [compliance]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!status) {
            setError("Status is required");
            return;
        }

        setIsSaving(true);
        setError("");
        try {
            await onConfirm({ status, remarks });
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to update status.");
        } finally {
            setIsSaving(false);
        }
    };

    const statuses = ["Pending", "In Progress", "Completed", "Overdue"];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-105 flex items-center justify-between">
                    <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5">
                        <CheckCircle2 className="text-slate-600" size={18} />
                        <span>Change Compliance Status</span>
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-650 rounded-lg text-xs font-semibold leading-relaxed border border-red-150">
                            {error}
                        </div>
                    )}

                    {/* Compliance Info */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                            Compliance Name
                        </span>
                        <span className="text-sm font-bold text-slate-800">
                            {compliance.compliance_name}
                        </span>
                    </div>

                    {/* Status Dropdown */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-650 uppercase tracking-wide block">
                            New Status <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="h-10 w-full rounded-md border border-slate-205 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-semibold text-slate-700"
                        >
                            {statuses.map((st) => (
                                <option key={st} value={st}>
                                    {st}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Remarks Textarea */}
                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-slate-655 uppercase tracking-wide block">
                                Update Remarks / Completion Notes
                            </label>
                            {status === "Completed" && (
                                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                                    Allows Completion Details
                                </span>
                            )}
                        </div>
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            rows={3}
                            placeholder="Provide comments for this status transition..."
                            className="w-full rounded-md border border-slate-205 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-semibold text-slate-700"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 h-9 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs cursor-pointer transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-4.5 h-9 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none transition-colors"
                        >
                            {isSaving && <Loader2 className="animate-spin" size={14} />}
                            <span>Save Status</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

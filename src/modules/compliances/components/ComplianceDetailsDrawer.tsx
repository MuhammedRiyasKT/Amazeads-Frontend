"use client";

import React from "react";
import { X, Calendar, User, ShieldAlert, Award, FileText, CheckCircle2, Info } from "lucide-react";
import { Compliance } from "../types/compliances.types";

interface ComplianceDetailsDrawerProps {
    compliance: Compliance | null;
    onClose: () => void;
}

export default function ComplianceDetailsDrawer({
    compliance,
    onClose,
}: ComplianceDetailsDrawerProps) {
    if (!compliance) return null;

    const formatDateReadable = (dateStr: string | null | undefined) => {
        if (!dateStr) return "—";
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }).replace(/,.*$/, ""); // Remove time for simple display or keep it depending on format
        } catch {
            return dateStr;
        }
    };

    const getPriorityBadgeClass = (priority: string) => {
        switch (priority) {
            case "Urgent":
                return "bg-purple-50 text-purple-700 border-purple-200";
            case "High":
                return "bg-rose-50 text-rose-700 border-rose-200";
            case "Medium":
                return "bg-blue-50 text-blue-700 border-blue-200";
            case "Low":
            default:
                return "bg-slate-50 text-slate-600 border-slate-200";
        }
    };

    const getStatusBadgeClass = (status: string, isOverdue: boolean) => {
        if (status === "Completed") {
            return "bg-emerald-50 text-emerald-700 border-emerald-250";
        }
        if (isOverdue || status === "Overdue") {
            return "bg-rose-50 text-rose-700 border-rose-250 font-black";
        }
        if (status === "In Progress") {
            return "bg-blue-50 text-blue-700 border-blue-200";
        }
        return "bg-amber-50 text-amber-700 border-amber-200";
    };

    const isOverdue = compliance.is_overdue && compliance.status !== "Completed";

    return (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end font-sans">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity cursor-pointer animate-fadeIn"
                onClick={onClose}
            />

            {/* Slide-in Content Panel */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-slideLeft">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                            Compliance Details
                        </span>
                        <h3 className="text-base font-black text-slate-850 truncate max-w-[280px]">
                            {compliance.compliance_name}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 px-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 rounded-lg transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable details wrapper */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Status & Priority Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Status
                            </span>
                            <span
                                className={`inline-flex px-2 px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadgeClass(
                                    compliance.status,
                                    compliance.is_overdue
                                )}`}
                            >
                                {isOverdue ? "Overdue" : compliance.status}
                            </span>
                        </div>
                        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Priority
                            </span>
                            <span
                                className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full border ${getPriorityBadgeClass(
                                    compliance.priority
                                )}`}
                            >
                                {compliance.priority}
                            </span>
                        </div>
                    </div>

                    {/* Section: Overview */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-black text-slate-805 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                            <Info size={14} className="text-slate-500" />
                            General Overview
                        </h4>
                        <div className="space-y-3">
                            <div>
                                <span className="text-[10px] font-bold text-slate-405 uppercase block">Type</span>
                                <span className="text-sm font-semibold text-slate-700">{compliance.compliance_type}</span>
                            </div>
                            {compliance.description && (
                                <div>
                                    <span className="text-[10px] font-bold text-slate-405 uppercase block">Description</span>
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        {compliance.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section: Deadlines info */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-black text-slate-805 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                            <Calendar size={14} className="text-slate-500" />
                            Due Dates & Deadlines
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-[10px] font-bold text-slate-405 uppercase block">Due Date</span>
                                <span className="text-sm font-bold text-slate-750">
                                    {formatDateReadable(compliance.due_date).split("at")[0]}
                                </span>
                                <span
                                    className={`text-[10px] font-bold block ${compliance.status === "Completed"
                                            ? "text-emerald-600"
                                            : isOverdue
                                                ? "text-rose-600 font-black animate-pulse"
                                                : "text-slate-500"
                                        }`}
                                >
                                    {compliance.status === "Completed"
                                        ? "Completed"
                                        : compliance.days_left > 0
                                            ? `${compliance.days_left} days left`
                                            : compliance.days_left === 0
                                                ? "Due today"
                                                : `${Math.abs(compliance.days_left)} days overdue`}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-405 uppercase block">Reminder Date</span>
                                <span className="text-sm font-semibold text-slate-700">
                                    {compliance.reminder_date
                                        ? formatDateReadable(compliance.reminder_date).split("at")[0]
                                        : "—"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Section: Assignments */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-black text-slate-805 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                            <User size={14} className="text-slate-500" />
                            Assignments Information
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-[10px] font-bold text-slate-405 uppercase block">Assigned To</span>
                                <span className="text-sm font-bold text-slate-750">
                                    {compliance.assigned_to_name || "—"}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-405 uppercase block">Assigned By</span>
                                <span className="text-sm font-semibold text-slate-700">
                                    {compliance.assigned_by_name || "—"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Remarks */}
                    {compliance.remarks && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-black text-slate-805 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                                <FileText size={14} className="text-slate-500" />
                                Remarks
                            </h4>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                                {compliance.remarks}
                            </p>
                        </div>
                    )}

                    {/* Completion Info */}
                    {compliance.status === "Completed" && (
                        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-2.5">
                            <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                                <CheckCircle2 size={14} className="text-emerald-600" />
                                Completion Log
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="text-[9px] font-bold text-emerald-600 uppercase block">Completed By</span>
                                    <span className="font-bold text-emerald-950">
                                        {compliance.completed_by_name || "System"}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[9px] font-bold text-emerald-600 uppercase block">Completed On</span>
                                    <span className="font-semibold text-emerald-900">
                                        {formatDateReadable(compliance.completed_on)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Audit Logs */}
                    <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                            Audit Logs
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase block">Created By</span>
                                <span className="font-bold text-slate-700">{compliance.created_by_name || "—"}</span>
                                <span className="text-[10px] font-medium text-slate-450 block">
                                    {formatDateReadable(compliance.created_on)}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase block">Updated By</span>
                                <span className="font-medium text-slate-705">{compliance.updated_by_name || "—"}</span>
                                <span className="text-[10px] font-medium text-slate-450 block">
                                    {formatDateReadable(compliance.updated_on)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

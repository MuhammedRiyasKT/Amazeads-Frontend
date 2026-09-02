"use client";

import React, { useState } from "react";
import { Eye, Edit2, CheckCircle, Trash2, MoreVertical, Calendar } from "lucide-react";
import { Compliance } from "../types/compliances.types";

interface ComplianceMobileCardProps {
    comp: Compliance;
    onView: (comp: Compliance) => void;
    onEdit?: (comp: Compliance) => void;
    onChangeStatus?: (comp: Compliance) => void;
    onDelete?: (comp: Compliance) => void;
}

export default function ComplianceMobileCard({
    comp,
    onView,
    onEdit,
    onChangeStatus,
    onDelete,
}: ComplianceMobileCardProps) {
    const [showActions, setShowActions] = useState(false);

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

    const formatDaysLeft = (daysLeft: number, isOverdue: boolean, isCompleted: boolean) => {
        if (isCompleted) return "Completed";
        if (daysLeft > 0) return `${daysLeft} days left`;
        if (daysLeft === 0) return "Due today";
        return `${Math.abs(daysLeft)} days overdue`;
    };

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

    const isOverdue = comp.is_overdue && comp.status !== "Completed";

    return (
        <div
            className={`bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 relative hover:shadow-xs transition-shadow ${isOverdue ? "border-l-4 border-l-rose-500" : ""
                }`}
        >
            {/* Top Header Card */}
            <div className="flex justify-between items-start gap-2">
                <div className="space-y-0.5">
                    <span className="font-black text-slate-800 text-base block cursor-pointer" onClick={() => onView(comp)}>
                        {comp.compliance_name}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                        {comp.compliance_type}
                    </span>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowActions(!showActions)}
                        className="p-1 px-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <MoreVertical size={16} />
                    </button>

                    {showActions && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                            <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg border border-slate-200 shadow-lg z-20 overflow-hidden divide-y divide-slate-100 animate-fadeIn">
                                <button
                                    onClick={() => {
                                        onView(comp);
                                        setShowActions(false);
                                    }}
                                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2"
                                >
                                    <Eye size={13} />
                                    View Details
                                </button>
                                {onEdit && (
                                    <button
                                        onClick={() => {
                                            onEdit(comp);
                                            setShowActions(false);
                                        }}
                                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2"
                                    >
                                        <Edit2 size={13} />
                                        Edit
                                    </button>
                                )}
                                {onChangeStatus && (
                                    <button
                                        onClick={() => {
                                            onChangeStatus(comp);
                                            setShowActions(false);
                                        }}
                                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2"
                                    >
                                        <CheckCircle size={13} />
                                        Change Status
                                    </button>
                                )}
                                {onDelete && (
                                    <button
                                        onClick={() => {
                                            onDelete(comp);
                                            setShowActions(false);
                                        }}
                                        className="w-full text-left px-4 py-2.5 hover:bg-rose-50 text-rose-600 font-bold text-xs flex items-center gap-2"
                                    >
                                        <Trash2 size={13} />
                                        Delete
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Middle info content */}
            <div className="grid grid-cols-2 gap-2 text-xs border-y border-slate-100 py-2.5">
                <div>
                    <span className="text-slate-400 font-medium block">Due Date</span>
                    <span className="font-bold text-slate-700 block">
                        {formatDateReadable(comp.due_date)}
                    </span>
                    <span
                        className={`text-[10px] font-bold block ${comp.status === "Completed"
                            ? "text-emerald-600"
                            : isOverdue
                                ? "text-rose-600 font-extrabold"
                                : "text-slate-500"
                            }`}
                    >
                        {formatDaysLeft(comp.days_left, comp.is_overdue, comp.status === "Completed")}
                    </span>
                </div>
                <div>
                    <span className="text-slate-400 font-medium block">Assigned To</span>
                    <span className="font-bold text-slate-750 block">{comp.assigned_to_name || "—"}</span>
                </div>
            </div>

            {/* Bottom badges layout */}
            <div className="flex items-center justify-between pt-1">
                <div className="flex gap-2">
                    <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getPriorityBadgeClass(
                            comp.priority
                        )}`}
                    >
                        {comp.priority}
                    </span>
                    <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadgeClass(
                            comp.status,
                            comp.is_overdue
                        )}`}
                    >
                        {isOverdue ? "Overdue" : comp.status}
                    </span>
                </div>
                {comp.reminder_date && (
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                        <Calendar size={10} />
                        Remind: {formatDateReadable(comp.reminder_date)}
                    </span>
                )}
            </div>
        </div>
    );
}

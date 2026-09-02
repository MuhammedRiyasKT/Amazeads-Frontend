"use client";

import React, { useState } from "react";
import { Eye, Edit2, CheckCircle, Trash2, MoreVertical, AlertTriangle } from "lucide-react";
import { Compliance } from "../types/compliances.types";

interface ComplianceTableProps {
    compliances: Compliance[];
    onView: (comp: Compliance) => void;
    onEdit?: (comp: Compliance) => void;
    onChangeStatus?: (comp: Compliance) => void;
    onDelete?: (comp: Compliance) => void;
    role?: string;
}

export default function ComplianceTable({
    compliances,
    onView,
    onEdit,
    onChangeStatus,
    onDelete,
}: ComplianceTableProps) {



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
            return "bg-rose-50 text-rose-700 border-rose-250 font-black animate-pulse";
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


    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden w-full">
            <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs border-collapse">
                    <thead>
                        <tr className="bg-slate-100/80 border-b border-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                            <th className="py-3 px-4 border-r border-slate-100">Compliance</th>
                            <th className="py-3 px-4 border-r border-slate-100">Due Date</th>
                            <th className="py-3 px-4 border-r border-slate-100">Assigned To</th>
                            <th className="py-3 px-4 border-r border-slate-100">Priority</th>
                            <th className="py-3 px-4 border-r border-slate-100">Status</th>
                            <th className="py-3 px-4 border-r border-slate-100">Reminder</th>
                            <th className="py-3 px-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {compliances.map((comp) => {
                            const isOverdue = comp.is_overdue && comp.status !== "Completed";
                            const isCompleted = comp.status === "Completed";

                            return (
                                <tr
                                    key={comp.id}
                                    className={`transition-colors hover:bg-slate-50/80 ${isOverdue ? "bg-rose-50/30 hover:bg-rose-50/40" : ""
                                        }`}
                                >
                                    {/* Compliance Name & Type */}
                                    <td className="py-3.5 px-4 border-r border-slate-100">
                                        <div className="space-y-0.5">
                                            <span className="font-bold text-slate-800 text-sm block">
                                                {comp.compliance_name}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                                                {comp.compliance_type}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Due Date & Days Left */}
                                    <td className="py-3.5 px-4 border-r border-slate-100">
                                        <div className="space-y-0.5">
                                            <span className="font-semibold text-slate-700 block">
                                                {formatDateReadable(comp.due_date)}
                                            </span>
                                            <span
                                                className={`text-[10px] font-bold block ${isCompleted
                                                    ? "text-emerald-600"
                                                    : isOverdue
                                                        ? "text-rose-600 flex items-center gap-0.5"
                                                        : "text-slate-500"
                                                    }`}
                                            >
                                                {isOverdue && <AlertTriangle size={10} />}
                                                {formatDaysLeft(comp.days_left, comp.is_overdue, isCompleted)}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Assigned To Staff */}
                                    <td className="py-3.5 px-4 border-r border-slate-100 font-bold text-slate-800">
                                        {comp.assigned_to_name || "—"}
                                    </td>

                                    {/* Priority Badge */}
                                    <td className="py-3.5 px-4 border-r border-slate-100">
                                        <span
                                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getPriorityBadgeClass(
                                                comp.priority
                                            )}`}
                                        >
                                            {comp.priority}
                                        </span>
                                    </td>

                                    {/* Status Badge */}
                                    <td className="py-3.5 px-4 border-r border-slate-100">
                                        <span
                                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadgeClass(
                                                comp.status,
                                                comp.is_overdue
                                            )}`}
                                        >
                                            {isOverdue ? "Overdue" : comp.status}
                                        </span>
                                    </td>

                                    {/* Reminder Date */}
                                    <td className="py-3.5 px-4 border-r border-slate-100 font-medium text-slate-500">
                                        {comp.reminder_date ? formatDateReadable(comp.reminder_date) : "—"}
                                    </td>

                                    {/* Actions Icons */}
                                    <td className="py-3.5 px-4 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <button
                                                onClick={() => onView(comp)}
                                                className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg cursor-pointer transition-colors shadow-2xs"
                                                title="View Details"
                                            >
                                                <Eye size={13} />
                                            </button>
                                            {onEdit && (
                                                <button
                                                    onClick={() => onEdit(comp)}
                                                    className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-205 rounded-lg cursor-pointer transition-colors shadow-2xs"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={13} />
                                                </button>
                                            )}
                                            {onChangeStatus && (
                                                <button
                                                    onClick={() => onChangeStatus(comp)}
                                                    className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-805 border border-slate-205 rounded-lg cursor-pointer transition-colors shadow-2xs"
                                                    title="Change Status"
                                                >
                                                    <CheckCircle size={13} />
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={() => onDelete(comp)}
                                                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-800 border border-rose-200 rounded-lg cursor-pointer transition-colors shadow-2xs"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

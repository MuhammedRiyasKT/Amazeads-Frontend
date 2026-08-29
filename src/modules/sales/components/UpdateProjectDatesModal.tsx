"use client";

import React, { useEffect, useState } from "react";
import { X, Calendar, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { updateProjectDates } from "../services/designApproval.service";

interface UpdateProjectDatesModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: any;
    order: any;
    onSuccess: () => void;
}

export default function UpdateProjectDatesModal({
    isOpen,
    onClose,
    project,
    order,
    onSuccess,
}: UpdateProjectDatesModalProps) {
    const [designDate, setDesignDate] = useState("");
    const [printingDate, setPrintingDate] = useState("");
    const [completedDate, setCompletedDate] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const commitDate = project?.commit_date || order?.commit_date;
    const completionDate = project?.completed_date || order?.completion_date;

    const minDateStr = commitDate ? commitDate.split("T")[0] : undefined;
    const maxDateStr = completionDate ? completionDate.split("T")[0] : undefined;

    useEffect(() => {
        if (project) {
            setDesignDate(project.design_date ? project.design_date.split("T")[0] : "");
            setPrintingDate(project.printing_date ? project.printing_date.split("T")[0] : "");
            setCompletedDate(project.completed_date ? project.completed_date.split("T")[0] : "");
            setError("");
        }
    }, [project, isOpen]);

    if (!isOpen || !project) return null;

    const formatDateLabel = (dateStr?: string) => {
        if (!dateStr) return "Not Set";
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        } catch {
            return dateStr;
        }
    };

    const isWithinRange = (dateStr: string) => {
        if (!commitDate || !completionDate) return true;
        const dateVal = new Date(dateStr);
        const start = new Date(commitDate);
        const end = new Date(completionDate);

        // Clear times for direct date comparison
        dateVal.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        return dateVal >= start && dateVal <= end;
    };

    const handleSave = async () => {
        setError("");

        if (designDate && !isWithinRange(designDate)) {
            setError(
                `Design Date must be between Commit Date (${formatDateLabel(commitDate)}) and Completion Date (${formatDateLabel(completionDate)})`
            );
            return;
        }

        if (printingDate && !isWithinRange(printingDate)) {
            setError(
                `Printing Date must be between Commit Date (${formatDateLabel(commitDate)}) and Completion Date (${formatDateLabel(completionDate)})`
            );
            return;
        }

        if (completedDate) {
            const dateVal = new Date(completedDate);
            dateVal.setHours(0, 0, 0, 0);
            if (commitDate) {
                const start = new Date(commitDate);
                start.setHours(0, 0, 0, 0);
                if (dateVal < start) {
                    setError(`Completion Date must be on or after Commit Date (${formatDateLabel(commitDate)})`);
                    return;
                }
            }
        }

        setIsSubmitting(true);
        try {
            await updateProjectDates(project.id, {
                design_date: designDate || null,
                printing_date: printingDate || null,
                completed_date: completedDate || null,
                completion_date: completedDate || null,
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Error updating project dates:", err);
            setError(err?.response?.data?.detail || "Failed to update project dates. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[2000] p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <Calendar className="text-indigo-600" size={16} />
                        <h3 className="font-bold text-slate-800 text-xs uppercase">Update Schedule Dates</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col gap-4 text-xs font-semibold text-slate-600">
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Product Line</span>
                        <strong className="text-slate-900 text-sm block mt-0.5">{project.project_name}</strong>
                    </div>

                    {/* Range Info Box */}
                    {(commitDate || completionDate) && (
                        <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-3 text-[11px] text-slate-500 space-y-1">
                            <span className="font-bold text-slate-600 uppercase text-[9px] block">Allowed Target Window:</span>
                            <div className="flex justify-between font-bold text-slate-700">
                                <span>Commit Date: {formatDateLabel(commitDate)}</span>
                                <span>Completion: {formatDateLabel(completionDate)}</span>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-start gap-1.5 p-2.5 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-[11px]">
                            <AlertCircle size={14} className="shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        {/* Design Date */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="design-date-input" className="text-[10px] uppercase text-slate-400 font-bold">
                                Design Date
                            </label>
                            <input
                                id="design-date-input"
                                type="date"
                                value={designDate}
                                onChange={(e) => setDesignDate(e.target.value)}
                                min={minDateStr}
                                max={maxDateStr}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                            />
                        </div>

                        {/* Print Date */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="print-date-input" className="text-[10px] uppercase text-slate-400 font-bold">
                                Print Date
                            </label>
                            <input
                                id="print-date-input"
                                type="date"
                                value={printingDate}
                                onChange={(e) => setPrintingDate(e.target.value)}
                                min={minDateStr}
                                max={maxDateStr}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                            />
                        </div>

                        {/* Completion Date */}
                        <div className="flex flex-col gap-1.5 col-span-2">
                            <label htmlFor="completed-date-input" className="text-[10px] uppercase text-slate-400 font-bold">
                                Completion Date
                            </label>
                            <input
                                id="completed-date-input"
                                type="date"
                                value={completedDate}
                                onChange={(e) => setCompletedDate(e.target.value)}
                                min={minDateStr}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 px-5 py-3 border-t bg-slate-50">
                    <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleSave} disabled={isSubmitting}>
                        {isSubmitting ? "Updating..." : "Update Dates"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

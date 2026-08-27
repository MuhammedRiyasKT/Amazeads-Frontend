// src/modules/project-manager/components/PMUpdateDatesModal.tsx

import React, { useEffect, useState } from "react";
import { X, Calendar, AlertCircle } from "lucide-react";
import { updateProjectDates } from "../services/managerOrder.service";

interface PMUpdateDatesModalProps {
    isOpen: boolean;
    projectId: number | null;
    projectName?: string;
    currentDesignDate: string | null;
    currentPrintingDate: string | null;
    commitDate: string | null;
    completionDate: string | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function PMUpdateDatesModal({
    isOpen,
    projectId,
    projectName,
    currentDesignDate,
    currentPrintingDate,
    commitDate,
    completionDate,
    onClose,
    onSuccess,
}: PMUpdateDatesModalProps) {
    const [designDate, setDesignDate] = useState("");
    const [printingDate, setPrintingDate] = useState("");
    const [errorDesign, setErrorDesign] = useState<string | null>(null);
    const [errorPrint, setErrorPrint] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [globalError, setGlobalError] = useState<string | null>(null);

    const formatDateStyle = (dateStr: string | null) => {
        if (!dateStr) return "—";
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        } catch {
            return dateStr;
        }
    };

    useEffect(() => {
        if (isOpen) {
            setDesignDate(currentDesignDate ? currentDesignDate.split("T")[0] : "");
            setPrintingDate(currentPrintingDate ? currentPrintingDate.split("T")[0] : "");
            setErrorDesign(null);
            setErrorPrint(null);
            setGlobalError(null);
        }
    }, [isOpen, currentDesignDate, currentPrintingDate]);

    const validateDesignDate = (val: string) => {
        if (!val) {
            setErrorDesign(null);
            return true;
        }
        const dVal = new Date(val).setHours(0, 0, 0, 0);

        if (commitDate) {
            const cVal = new Date(commitDate).setHours(0, 0, 0, 0);
            if (dVal < cVal) {
                setErrorDesign(`Design date cannot be earlier than Commit Date (${formatDateStyle(commitDate)})`);
                return false;
            }
        }

        if (completionDate) {
            const compVal = new Date(completionDate).setHours(0, 0, 0, 0);
            if (dVal > compVal) {
                setErrorDesign(`Design date cannot be later than Completion Date (${formatDateStyle(completionDate)})`);
                return false;
            }
        }

        setErrorDesign(null);
        return true;
    };

    const validatePrintingDate = (val: string) => {
        if (!val) {
            setErrorPrint(null);
            return true;
        }
        const pVal = new Date(val).setHours(0, 0, 0, 0);

        if (commitDate) {
            const cVal = new Date(commitDate).setHours(0, 0, 0, 0);
            if (pVal < cVal) {
                setErrorPrint(`Printing date cannot be earlier than Commit Date (${formatDateStyle(commitDate)})`);
                return false;
            }
        }

        if (completionDate) {
            const compVal = new Date(completionDate).setHours(0, 0, 0, 0);
            if (pVal > compVal) {
                setErrorPrint(`Printing date cannot be later than Completion Date (${formatDateStyle(completionDate)})`);
                return false;
            }
        }

        setErrorPrint(null);
        return true;
    };

    if (!isOpen || !projectId) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const isDesignValid = validateDesignDate(designDate);
        const isPrintValid = validatePrintingDate(printingDate);

        if (!isDesignValid || !isPrintValid) {
            return;
        }

        setIsSubmitting(true);
        setGlobalError(null);

        try {
            await updateProjectDates(projectId, {
                design_date: designDate || null,
                printing_date: printingDate || null,
                completion_date: null,
                completed_date: null,
            });
            onSuccess();
        } catch (err: any) {
            console.error("Error updating project dates:", err);
            setGlobalError(err.response?.data?.message || "Failed to update project dates. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[2500] p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <Calendar className="text-indigo-600" size={18} />
                        <div>
                            <h3 className="font-extrabold text-slate-800 text-sm uppercase leading-tight">
                                Update Project Dates
                            </h3>
                            {projectName && (
                                <p className="text-[10px] text-slate-550 font-bold mt-0.5 max-w-[280px] truncate">
                                    Project: <span className="text-slate-800">{projectName}</span>
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-405 hover:text-slate-600 cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Ranges reminder */}
                    <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-[10.5px] font-semibold text-slate-600 space-y-1">
                        <div className="flex justify-between">
                            <span>Commit Date:</span>
                            <strong className="text-slate-800">{formatDateStyle(commitDate)}</strong>
                        </div>
                        <div className="flex justify-between">
                            <span>Completion Date:</span>
                            <strong className="text-slate-800">{formatDateStyle(completionDate)}</strong>
                        </div>
                    </div>

                    {globalError && (
                        <div className="bg-rose-50 border border-rose-150 rounded-xl p-3 flex gap-2 text-[10.5px] font-semibold text-rose-600">
                            <AlertCircle size={15} className="shrink-0" />
                            <span>{globalError}</span>
                        </div>
                    )}

                    {/* Design Date Input */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase text-slate-450 font-black tracking-wider">
                            Design Date Target
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                value={designDate}
                                onChange={(e) => {
                                    setDesignDate(e.target.value);
                                    validateDesignDate(e.target.value);
                                }}
                                className={`w-full bg-white border ${errorDesign ? "border-rose-300 focus:ring-rose-50" : "border-slate-205 focus:ring-indigo-50"} rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-4 focus:border-indigo-500`}
                            />
                        </div>
                        {errorDesign && (
                            <p className="text-[10px] font-bold text-rose-500 mt-0.5">{errorDesign}</p>
                        )}
                    </div>

                    {/* Printing Date Input */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase text-slate-450 font-black tracking-wider">
                            Printing Date Target
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                value={printingDate}
                                onChange={(e) => {
                                    setPrintingDate(e.target.value);
                                    validatePrintingDate(e.target.value);
                                }}
                                className={`w-full bg-white border ${errorPrint ? "border-rose-300 focus:ring-rose-50" : "border-slate-205 focus:ring-indigo-50"} rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-4 focus:border-indigo-500`}
                            />
                        </div>
                        {errorPrint && (
                            <p className="text-[10px] font-bold text-rose-500 mt-0.5">{errorPrint}</p>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-2 border-t flex justify-end gap-2 text-xs font-bold">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-slate-200 text-slate-650 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                            Cancel
                        </button>
                        <button
    type="submit"
    disabled={isSubmitting || !!errorDesign || !!errorPrint}
    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-sm"
>
    {isSubmitting ? "Saving..." : "Save Dates"}
</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

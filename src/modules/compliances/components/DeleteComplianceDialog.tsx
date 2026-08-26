"use client";

import React, { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Compliance } from "../types/compliances.types";

interface DeleteComplianceDialogProps {
    compliance: Compliance;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}

export default function DeleteComplianceDialog({
    compliance,
    onClose,
    onConfirm,
}: DeleteComplianceDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await onConfirm();
        } catch (err) {
            console.error(err);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn animate-duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 p-6 space-y-4">
                {/* Warning Indicator */}
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600">
                        <AlertTriangle size={22} />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-slate-800">Delete Compliance</h3>
                        <p className="text-xs text-slate-500 font-medium">This action cannot be undone.</p>
                    </div>
                </div>

                {/* Info Confirmation Text */}
                <p className="text-sm text-slate-600 font-semibold leading-relaxed">
                    Are you sure you want to delete the compliance{" "}
                    <strong className="text-slate-900">"{compliance.compliance_name}"</strong>?
                </p>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 h-9 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs cursor-pointer transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        disabled={isDeleting}
                        onClick={handleDelete}
                        className="px-4.5 h-9 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none transition-colors"
                    >
                        {isDeleting && <Loader2 className="animate-spin" size={14} />}
                        <span>Delete Compliance</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

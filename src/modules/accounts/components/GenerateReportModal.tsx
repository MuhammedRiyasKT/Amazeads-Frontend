// src/modules/accounts/components/GenerateReportModal.tsx

"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, AlertCircle, Eye, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (dateStr: string) => Promise<boolean | "duplicate">;
  onViewExisting: (dateStr: string) => void;
}

export default function GenerateReportModal({
  isOpen,
  onClose,
  onGenerate,
  onViewExisting,
}: GenerateReportModalProps) {
  const [reportDate, setReportDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showViewButton, setShowViewButton] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReportDate(new Date().toISOString().split("T")[0]);
      setErrorMsg(null);
      setShowViewButton(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDate) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    setShowViewButton(false);

    try {
      const result = await onGenerate(reportDate);
      if (result === "duplicate") {
        setErrorMsg("Sales report already exists for this date.");
        setShowViewButton(true);
      } else if (result === true) {
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.response?.data?.detail || "Failed to generate sales report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-[2500] flex items-center justify-center p-4">
      {/* Backdrop click close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog Card */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden z-10 border animate-zoom-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Calendar size={14} className="text-slate-500" /> Generate Sales Report
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Report Date *</label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 cursor-pointer font-semibold text-slate-700"
              required
            />
          </div>

          {/* Inline Alert Messages */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 text-xs text-rose-700 font-semibold flex gap-2">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <p className="leading-relaxed">{errorMsg}</p>
                {showViewButton && (
                  <button
                    type="button"
                    onClick={() => {
                      onViewExisting(reportDate);
                      onClose();
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-800 cursor-pointer mt-1"
                  >
                    <Eye size={12} /> View Report
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer font-bold bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> Generating...
                </>
              ) : (
                "Generate Report"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

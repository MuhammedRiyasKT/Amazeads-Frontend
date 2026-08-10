// src/modules/hr/components/AddEditHolidayModal.tsx

"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar } from "lucide-react";
import { Holiday, CreateHolidayPayload } from "../types/attendance.types";

interface AddEditHolidayModalProps {
  isOpen: boolean;
  holiday: Holiday | null;
  onClose: () => void;
  onSubmit: (payload: CreateHolidayPayload) => Promise<void>;
}

export default function AddEditHolidayModal({
  isOpen,
  holiday,
  onClose,
  onSubmit,
}: AddEditHolidayModalProps) {
  const [holidayName, setHolidayName] = useState("");
  const [holidayDate, setHolidayDate] = useState("");
  const [isOptional, setIsOptional] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (holiday) {
      setHolidayName(holiday.holiday_name || "");
      setHolidayDate(holiday.holiday_date || "");
      setIsOptional(Boolean(holiday.is_optional));
    } else {
      setHolidayName("");
      setHolidayDate(new Date().toISOString().split("T")[0]);
      setIsOptional(false);
    }
    setErrorMsg("");
  }, [holiday, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayName.trim()) {
      setErrorMsg("Please enter a holiday name.");
      return;
    }
    if (!holidayDate) {
      setErrorMsg("Please select a date.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await onSubmit({
        holiday_name: holidayName.trim(),
        holiday_date: holidayDate,
        is_optional: isOptional,
      });
      onClose();
    } catch (err: any) {
      console.error("Error saving holiday:", err);
      setErrorMsg(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to save holiday."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/80">
          <h3 className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-2">
            <Calendar size={16} className="text-indigo-600" />
            {holiday ? "Edit Holiday" : "Add Holiday"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Holiday Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-slate-700">Holiday Name</label>
            <input
              type="text"
              value={holidayName}
              onChange={(e) => setHolidayName(e.target.value)}
              placeholder="e.g. Onam, Independence Day..."
              className="px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-500 font-medium"
              required
            />
          </div>

          {/* Holiday Date */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-slate-700">Holiday Date</label>
            <input
              type="date"
              value={holidayDate}
              onChange={(e) => setHolidayDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-500 font-medium"
              required
            />
          </div>

          {/* Holiday Type Radio */}
          <div className="flex flex-col gap-2 pt-1">
            <label className="font-bold text-slate-700">Holiday Type</label>
            <div className="flex items-center gap-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="is_optional"
                  checked={!isOptional}
                  onChange={() => setIsOptional(false)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium text-slate-700">Regular Holiday</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="is_optional"
                  checked={isOptional}
                  onChange={() => setIsOptional(true)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium text-slate-700">Optional Holiday</span>
              </label>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : holiday
                ? "Update Holiday"
                : "Add Holiday"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

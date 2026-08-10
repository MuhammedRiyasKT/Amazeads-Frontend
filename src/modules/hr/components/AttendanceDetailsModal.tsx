// src/modules/hr/components/AttendanceDetailsModal.tsx

"use client";

import React from "react";
import { X, User, Clock, Calendar, FileText, CheckCircle2 } from "lucide-react";
import { AttendanceStaff } from "../types/attendance.types";

interface AttendanceDetailsModalProps {
  isOpen: boolean;
  staff: AttendanceStaff | null;
  onClose: () => void;
}

const formatAttendanceTime = (timeStr: string | null | undefined) => {
  if (!timeStr) return "—";
  try {
    if (!timeStr.includes("T")) return timeStr;
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return timeStr;
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (e) {
    return timeStr;
  }
};

export default function AttendanceDetailsModal({
  isOpen,
  staff,
  onClose,
}: AttendanceDetailsModalProps) {
  if (!isOpen || !staff) return null;

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s.includes("present"))
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s.includes("absent"))
      return "bg-rose-50 text-rose-700 border-rose-200";
    if (s.includes("leave"))
      return "bg-amber-50 text-amber-700 border-amber-200";
    if (s.includes("half"))
      return "bg-purple-50 text-purple-700 border-purple-200";
    if (s.includes("working"))
      return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/80">
          <h3 className="font-bold text-slate-800 text-sm tracking-tight">
            Attendance Details
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4 text-xs text-slate-600">
          {/* Staff Info */}
          <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base">
              {(staff.staff_name || "S")[0].toUpperCase()}
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                {staff.staff_name || "—"}
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold uppercase mt-0.5">
                {staff.department_name || staff.role_name || "Department: —"}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Attendance Status
            </span>
            <span
              className={`px-3 py-1 text-xs font-bold rounded-lg border ${getStatusBadge(
                staff.status
              )}`}
            >
              {staff.status || "—"}
            </span>
          </div>

          {/* Check In / Out & Hours Grid */}
          <div className="grid grid-cols-3 gap-2.5 bg-slate-50/60 p-3 rounded-lg border border-slate-100">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Clock size={12} className="text-emerald-600" /> Check In
              </span>
              <span className="font-bold text-slate-800">
                {formatAttendanceTime(staff.check_in)}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Clock size={12} className="text-rose-600" /> Check Out
              </span>
              <span className="font-bold text-slate-800">
                {formatAttendanceTime(staff.check_out)}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Calendar size={12} className="text-indigo-600" /> Hours
              </span>
              <span className="font-bold text-slate-800">
                {staff.worked_hours ||
                  (staff.working_minutes
                    ? `${Math.floor(staff.working_minutes / 60)}h ${
                        staff.working_minutes % 60
                      }m`
                    : "—")}
              </span>
            </div>
          </div>

          {/* Remarks */}
          <div className="flex flex-col gap-1 border-t border-slate-100 pt-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <FileText size={12} /> Remarks
            </span>
            <p className="text-slate-700 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
              {staff.remarks || "No remarks provided"}
            </p>
          </div>

          {/* Leave Info if available */}
          {(staff.leave_type || staff.leave_reason) && (
            <div className="flex flex-col gap-2 border-t border-slate-100 pt-3 bg-amber-50/30 p-3 rounded-lg border border-amber-100">
              <span className="text-[10px] font-bold text-amber-700 uppercase flex items-center gap-1">
                Leave Details
              </span>
              {staff.leave_type && (
                <div>
                  <span className="text-slate-400 font-medium">Type: </span>
                  <span className="font-bold text-amber-800">
                    {staff.leave_type}
                  </span>
                </div>
              )}
              {staff.leave_reason && (
                <div>
                  <span className="text-slate-400 font-medium">Reason: </span>
                  <span className="text-slate-700 italic">
                    "{staff.leave_reason}"
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

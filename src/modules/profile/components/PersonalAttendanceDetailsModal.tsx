// src/modules/profile/components/PersonalAttendanceDetailsModal.tsx

"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, LogIn, LogOut, PartyPopper, CalendarX, AlertCircle, Loader2 } from "lucide-react";
import { getTodayAttendanceLog } from "../services/personalAttendance.service";

interface PersonalAttendanceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string | null;
  currentUserId?: number;
  currentStaffName?: string;
}

interface DetailedRecord {
  status: string;
  check_in?: string | null;
  check_out?: string | null;
  worked_hours?: string | number | null;
  working_minutes?: number | null;
  holiday_name?: string | null;
  holiday_status?: boolean;
  leave_type?: string | null;
  leave_reason?: string | null;
  remarks?: string | null;
}

const formatTime = (timeStr: string | null | undefined) => {
  if (!timeStr) return "—";
  try {
    if (!timeStr.includes("T")) return timeStr;
    const d = new Date(timeStr);
    if (isNaN(d.getTime())) return timeStr;
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return timeStr;
  }
};

const formatDateFriendly = (dateStr: string | null | undefined) => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

export default function PersonalAttendanceDetailsModal({
  isOpen,
  onClose,
  date,
  currentUserId,
  currentStaffName,
}: PersonalAttendanceDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [record, setRecord] = useState<DetailedRecord | null>(null);

  useEffect(() => {
    if (!isOpen || !date) return;

    async function fetchDetails() {
      setIsLoading(true);
      setError(null);
      setRecord(null);

      try {
        const res = await getTodayAttendanceLog(date!);
        const items = res.items || [];
        const firstItem = items[0];

        if (firstItem) {
          const staffs = firstItem.staffs || [];
          let matched: any = null;

          if (staffs.length > 0) {
            if (currentUserId) {
              matched = staffs.find((s: any) => s.staff_id === currentUserId);
            }
            if (!matched && currentStaffName) {
              matched = staffs.find(
                (s: any) =>
                  s.staff_name &&
                  s.staff_name.toLowerCase().trim() === currentStaffName.toLowerCase().trim()
              );
            }
            if (!matched) matched = staffs[0];
          } else {
            matched = firstItem;
          }

          if (matched) {
            setRecord({
              status: firstItem.holiday_status ? "Holiday" : matched.status || firstItem.status || "—",
              check_in: matched.check_in || firstItem.check_in || null,
              check_out: matched.check_out || firstItem.check_out || null,
              worked_hours: matched.worked_hours ?? firstItem.worked_hours ?? null,
              working_minutes: matched.working_minutes ?? firstItem.working_minutes ?? null,
              holiday_name: firstItem.holiday_name || matched.holiday_name || null,
              holiday_status: firstItem.holiday_status || matched.holiday_status || false,
              leave_type: matched.leave_type || null,
              leave_reason: matched.leave_reason || null,
              remarks: matched.remarks || null,
            });
          } else {
            setRecord({ status: "No record" });
          }
        } else {
          setRecord({ status: "No record" });
        }
      } catch (err: any) {
        console.error("Error fetching attendance details for modal:", err);
        setError("Failed to load attendance details for the selected date.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDetails();
  }, [isOpen, date, currentUserId, currentStaffName]);

  if (!isOpen) return null;

  // Calculate worked hours display string
  let workedHoursStr = "—";
  if (record?.worked_hours !== undefined && record?.worked_hours !== null && record?.worked_hours !== 0) {
    workedHoursStr = typeof record.worked_hours === "number" ? `${record.worked_hours}h` : String(record.worked_hours);
  } else if (record?.working_minutes) {
    const hrs = Math.floor(record.working_minutes / 60);
    const mins = record.working_minutes % 60;
    workedHoursStr = `${hrs}h ${mins}m`;
  }

  const getStatusBadgeClass = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("holiday")) return "bg-indigo-50 text-indigo-700 border-indigo-200";
    if (s.includes("leave")) return "bg-amber-50 text-amber-700 border-amber-200";
    if (s.includes("present")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s.includes("half")) return "bg-purple-50 text-purple-700 border-purple-200";
    if (s.includes("absent")) return "bg-rose-50 text-rose-700 border-rose-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[3000] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Attendance Details</h3>
              <p className="text-xs font-semibold text-slate-500">{formatDateFriendly(date)}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-2">
              <Loader2 className="animate-spin text-indigo-600" size={24} />
              <span className="text-xs font-semibold">Fetching detailed log...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-center space-y-2">
              <AlertCircle size={20} className="text-rose-600 mx-auto" />
              <p className="text-xs font-bold text-rose-700">{error}</p>
            </div>
          ) : !record || record.status === "No record" ? (
            <div className="py-10 text-center text-slate-400 text-xs font-semibold">
              No detailed attendance logs recorded for this date.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Status Header Badge */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  Day Status
                </span>
                <span className={`px-3 py-1 rounded-lg text-xs font-extrabold border ${getStatusBadgeClass(record.status)}`}>
                  {record.status}
                </span>
              </div>

              {/* Special Info (Holiday / Leave) */}
              {record.holiday_status || record.holiday_name ? (
                <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center gap-3">
                  <PartyPopper size={20} className="text-indigo-600 shrink-0" />
                  <div>
                    <div className="text-xs font-extrabold text-indigo-950">
                      {record.holiday_name || "Official Holiday"}
                    </div>
                    <p className="text-[11px] text-indigo-700 font-medium mt-0.5">
                      This date was marked as an official holiday.
                    </p>
                  </div>
                </div>
              ) : record.leave_type || record.leave_reason ? (
                <div className="p-4 bg-amber-50/70 border border-amber-100 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-900">
                    <CalendarX size={16} className="text-amber-600" />
                    <span>Leave Information</span>
                  </div>
                  {record.leave_type && (
                    <div className="text-xs text-amber-800 font-semibold">
                      Type: {record.leave_type}
                    </div>
                  )}
                  {record.leave_reason && (
                    <p className="text-xs text-slate-600 italic bg-white/80 p-2.5 rounded-lg border border-amber-200/50">
                      "{record.leave_reason}"
                    </p>
                  )}
                </div>
              ) : null}

              {/* Time Breakdown Cards */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                {/* Check In */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-center gap-1 text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                    <LogIn size={12} className="text-emerald-600" /> Check In
                  </div>
                  <div className="text-xs sm:text-sm font-black text-slate-900">
                    {formatTime(record.check_in)}
                  </div>
                </div>

                {/* Check Out */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-center gap-1 text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                    <LogOut size={12} className="text-rose-600" /> Check Out
                  </div>
                  <div className="text-xs sm:text-sm font-black text-slate-900">
                    {formatTime(record.check_out)}
                  </div>
                </div>

                {/* Worked Hours */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-center gap-1 text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                    <Clock size={12} className="text-indigo-600" /> Duration
                  </div>
                  <div className="text-xs sm:text-sm font-black text-indigo-600">
                    {workedHoursStr}
                  </div>
                </div>
              </div>

              {/* Remarks if any */}
              {record.remarks && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                  <span className="font-extrabold text-slate-500 uppercase tracking-wider block mb-1 text-[10px]">
                    Remarks
                  </span>
                  <p className="text-slate-700 font-semibold">{record.remarks}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// src/modules/profile/components/TodayAttendanceCard.tsx

"use client";

import React from "react";
import {
  Calendar,
  Clock,
  LogIn,
  LogOut,
  CheckCircle2,
  AlertCircle,
  PartyPopper,
  CalendarX,
  ShieldAlert,
} from "lucide-react";
import { SharedAttendanceStaff, SharedAttendanceItem } from "../types/personalAttendance.types";

interface TodayAttendanceCardProps {
  isAdmin: boolean;
  todayRecord: SharedAttendanceStaff | null;
  todayItem: SharedAttendanceItem | null;
  isLoading: boolean;
  isActionLoading: boolean;
  onCheckIn: () => void;
  onCheckOutClick: () => void;
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

export default function TodayAttendanceCard({
  isAdmin,
  todayRecord,
  todayItem,
  isLoading,
  isActionLoading,
  onCheckIn,
  onCheckOutClick,
}: TodayAttendanceCardProps) {
  // Today's formatted date string
  const todayDateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col items-center justify-center min-h-[220px]">
        <div className="w-7 h-7 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-semibold text-slate-500 mt-3">
          Loading today's attendance...
        </span>
      </div>
    );
  }

  // Admin view banner restriction
  if (isAdmin) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <Calendar size={18} className="text-indigo-600" />
            Today's Attendance
          </h2>
          <span className="text-xs text-slate-400 font-semibold">{todayDateStr}</span>
        </div>

        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-800 text-xs font-semibold">
          <ShieldAlert size={20} className="text-amber-600 shrink-0" />
          <span>
            Attendance actions are not available for Admin users. Please manage staff attendance under <strong>HR & Staff</strong> section.
          </span>
        </div>
      </div>
    );
  }

  // Determine state
  const isHoliday = Boolean(todayItem?.holiday_status || todayItem?.holiday_name);
  const holidayName = todayItem?.holiday_name || "Official Holiday";

  const rawStatus = (todayRecord?.status || "").toLowerCase();
  const isLeave = rawStatus.includes("leave") || Boolean(todayRecord?.leave_type);

  const checkInTime = todayRecord?.check_in ? formatAttendanceTime(todayRecord.check_in) : null;
  const checkOutTime = todayRecord?.check_out ? formatAttendanceTime(todayRecord.check_out) : null;

  const isCompleted = Boolean(checkInTime && checkOutTime);
  const isWorking = Boolean(checkInTime && !checkOutTime);
  const isNotCheckedIn = !checkInTime && !isHoliday && !isLeave;

  // Worked hours display calculation
  let workedHoursDisplay = "—";
  if (todayRecord?.worked_hours !== undefined && todayRecord?.worked_hours !== null && todayRecord?.worked_hours !== 0) {
    workedHoursDisplay = typeof todayRecord.worked_hours === "number" ? `${todayRecord.worked_hours}h` : String(todayRecord.worked_hours);
  } else if (todayRecord?.working_minutes) {
    const hrs = Math.floor(todayRecord.working_minutes / 60);
    const mins = todayRecord.working_minutes % 60;
    workedHoursDisplay = `${hrs}h ${mins}m`;
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col gap-5">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
        <div>
          <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <Calendar size={18} className="text-indigo-600" />
            Today's Attendance
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">{todayDateStr}</p>
        </div>

        {/* Status Badge Top Right */}
        <div>
          {isHoliday && (
            <span className="px-3 py-1 text-xs font-extrabold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 inline-flex items-center gap-1.5">
              <PartyPopper size={14} /> Holiday
            </span>
          )}
          {isLeave && (
            <span className="px-3 py-1 text-xs font-extrabold rounded-lg bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1.5">
              <CalendarX size={14} /> On Leave
            </span>
          )}
          {isNotCheckedIn && (
            <span className="px-3 py-1 text-xs font-extrabold rounded-lg bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1.5">
              🔴 Not Checked In
            </span>
          )}
          {isWorking && (
            <span className="px-3 py-1 text-xs font-extrabold rounded-lg bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1.5">
              🟡 Currently Working
            </span>
          )}
          {isCompleted && (
            <span className="px-3 py-1 text-xs font-extrabold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5">
              🟢 Attendance Completed
            </span>
          )}
        </div>
      </div>

      {/* Card Main Body */}
      {isHoliday ? (
        <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-xl flex flex-col items-center justify-center text-center gap-2">
          <PartyPopper size={32} className="text-indigo-600" />
          <h3 className="font-extrabold text-indigo-950 text-base">{holidayName}</h3>
          <p className="text-xs text-indigo-700 font-medium">
            Today is designated as a holiday. Enjoy your time off!
          </p>
        </div>
      ) : isLeave ? (
        <div className="p-5 bg-amber-50/50 border border-amber-100 rounded-xl flex flex-col gap-2">
          <div className="flex items-center gap-2 font-extrabold text-amber-900 text-sm">
            <CalendarX size={18} className="text-amber-600" />
            <span>Leave Details</span>
          </div>
          {todayRecord?.leave_type && (
            <div className="text-xs font-medium text-amber-800">
              <strong>Type:</strong> {todayRecord.leave_type}
            </div>
          )}
          {todayRecord?.leave_reason && (
            <div className="text-xs font-medium text-slate-700 italic bg-white/70 p-2.5 rounded-lg border border-amber-200/50">
              "{todayRecord.leave_reason}"
            </div>
          )}
        </div>
      ) : isNotCheckedIn ? (
        /* State 1: Not Checked In */
        <div className="flex flex-col items-center justify-center py-4 gap-4 text-center">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</span>
            <span className="text-lg font-black text-rose-600">Not Checked In</span>
          </div>

          <button
            type="button"
            onClick={onCheckIn}
            disabled={isActionLoading}
            className="w-full max-w-sm py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn size={18} />
            {isActionLoading ? "Checking In..." : "CHECK IN"}
          </button>
        </div>
      ) : isWorking ? (
        /* State 2: Currently Working */
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Clock size={14} className="text-emerald-600" /> Check In Time
              </span>
              <span className="text-base font-extrabold text-slate-900">{checkInTime}</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Clock size={14} className="text-amber-600" /> Status
              </span>
              <span className="text-base font-extrabold text-amber-600 animate-pulse">
                In Progress (Working)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onCheckOutClick}
            disabled={isActionLoading}
            className="w-full py-3.5 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogOut size={18} />
            {isActionLoading ? "Checking Out..." : "CHECK OUT"}
          </button>
        </div>
      ) : (
        /* State 3: Completed */
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3 bg-slate-50/80 p-4 rounded-xl border border-slate-100 text-center">
            <div className="flex flex-col gap-1 border-r border-slate-200/80 pr-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Check In</span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900">{checkInTime}</span>
            </div>

            <div className="flex flex-col gap-1 border-r border-slate-200/80 pr-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Check Out</span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900">{checkOutTime}</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Worked Hours</span>
              <span className="text-xs sm:text-sm font-extrabold text-indigo-600">{workedHoursDisplay}</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center gap-2 text-emerald-800 text-xs font-extrabold text-center">
            <CheckCircle2 size={16} /> Completed Today's Shift
          </div>
        </div>
      )}
    </div>
  );
}

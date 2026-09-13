// src/modules/attendance-report/components/StaffWiseAttendanceModal.tsx

"use client";

import React, { useMemo } from "react";
import { X, Users, User } from "lucide-react";
import { AttendanceReportItem, StaffReportItem } from "../types/attendanceReport.types";

interface StaffWiseAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: AttendanceReportItem | null;
}

export default function StaffWiseAttendanceModal({
  isOpen,
  onClose,
  item,
}: StaffWiseAttendanceModalProps) {
  if (!isOpen || !item) return null;

  // Format date range for subtitle
  const dateRangeStr = useMemo(() => {
    if (!item.from_date || !item.to_date) return item.date || "";
    if (item.from_date === item.to_date) {
      return formatDate(item.from_date);
    }
    return `${formatDate(item.from_date)} – ${formatDate(item.to_date)}`;
  }, [item]);

  function formatDate(str: string) {
    try {
      const d = new Date(str);
      if (isNaN(d.getTime())) return str;
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return str;
    }
  }

  // Group staff reports by role/department
  const groupedStaff = useMemo(() => {
    const reports = item.staff_reports || [];
    const groups: { [key: string]: StaffReportItem[] } = {};

    reports.forEach((staff) => {
      const role = (staff.role_name || "General").trim();
      if (!groups[role]) {
        groups[role] = [];
      }
      groups[role].push(staff);
    });

    return groups;
  }, [item]);

  const totalStaff = item.total_staffs_count ?? item.staff_reports?.length ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[88vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-white sticky top-0 z-10">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {item.name || dateRangeStr}
            </h2>
            <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <span>{dateRangeStr}</span>
              <span>·</span>
              <span className="font-bold text-slate-500">{totalStaff} staff</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body - Staff Reports Grouped by Role */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[calc(88vh-130px)]">
          {!item.staff_reports || item.staff_reports.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Users size={22} />
              </div>
              <p className="text-xs font-bold text-slate-500">
                No individual staff records found for this period.
              </p>
            </div>
          ) : (
            Object.entries(groupedStaff).map(([roleName, staffList]) => (
              <div key={roleName} className="space-y-2">
                {/* Department Group Title */}
                <div className="flex items-center gap-2 pb-1">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                    {roleName}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">
                    ({staffList.length})
                  </span>
                </div>

                {/* Department Staff Table */}
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200/80 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        <th className="py-2.5 px-3 w-1/4">STAFF</th>
                        <th className="py-2.5 px-3 text-right">WORKING DAYS</th>
                        <th className="py-2.5 px-3 text-right">PRESENT</th>
                        <th className="py-2.5 px-3 text-right">ABSENT</th>
                        <th className="py-2.5 px-3 text-right">LEAVE</th>
                        <th className="py-2.5 px-3 text-right">HOLIDAY</th>
                        <th className="py-2.5 px-3 text-right">HALF DAY</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dashed divide-slate-200/80 text-xs">
                      {staffList.map((staff) => (
                        <tr key={staff.staff_id} className="hover:bg-slate-50/60 transition-colors">
                          {/* Staff Name */}
                          <td className="py-3 px-3 font-extrabold text-slate-800">
                            {staff.staff_name}
                          </td>

                          {/* Working Days */}
                          <td className="py-3 px-3 text-right font-bold text-slate-700">
                            {staff.total_working_days}
                          </td>

                          {/* Present */}
                          <td className="py-3 px-3 text-right">
                            <span
                              className={
                                staff.presents > 0
                                  ? "font-extrabold text-emerald-600"
                                  : "font-semibold text-slate-400"
                              }
                            >
                              {staff.presents}
                            </span>
                          </td>

                          {/* Absent */}
                          <td className="py-3 px-3 text-right">
                            <span
                              className={
                                staff.absents > 0
                                  ? "font-extrabold text-rose-600"
                                  : "font-semibold text-slate-400"
                              }
                            >
                              {staff.absents}
                            </span>
                          </td>

                          {/* Leave */}
                          <td className="py-3 px-3 text-right">
                            <span
                              className={
                                staff.leave > 0
                                  ? "font-extrabold text-amber-600"
                                  : "font-semibold text-slate-400"
                              }
                            >
                              {staff.leave}
                            </span>
                          </td>

                          {/* Holiday */}
                          <td className="py-3 px-3 text-right">
                            <span
                              className={
                                staff.holiday > 0
                                  ? "font-extrabold text-purple-600"
                                  : "font-semibold text-slate-400"
                              }
                            >
                              {staff.holiday}
                            </span>
                          </td>

                          {/* Half Day */}
                          <td className="py-3 px-3 text-right">
                            <span
                              className={
                                staff.halfday > 0
                                  ? "font-extrabold text-sky-600"
                                  : "font-semibold text-slate-400"
                              }
                            >
                              {staff.halfday}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

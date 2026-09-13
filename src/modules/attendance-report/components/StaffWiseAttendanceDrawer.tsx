// src/modules/attendance-report/components/StaffWiseAttendanceDrawer.tsx

"use client";

import React, { useMemo, useState, useEffect } from "react";
import { X, Search, Users, SlidersHorizontal, ChevronRight } from "lucide-react";
import { AttendanceReportItem, StaffReportItem } from "../types/attendanceReport.types";

interface StaffWiseAttendanceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: AttendanceReportItem | null;
}

export default function StaffWiseAttendanceDrawer({
  isOpen,
  onClose,
  item,
}: StaffWiseAttendanceDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Reset search query when drawer opens/closes or item changes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen, item]);

  // Format date range for subtitle
  const dateRangeStr = useMemo(() => {
    if (!item) return "";
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

  // Group staff reports by role/department & filter by search query
  const groupedStaff = useMemo(() => {
    if (!item || !item.staff_reports) return {};

    const query = searchQuery.trim().toLowerCase();
    const reports = item.staff_reports.filter((staff) => {
      if (!query) return true;
      const nameMatch = staff.staff_name.toLowerCase().includes(query);
      const roleMatch = (staff.role_name || "").toLowerCase().includes(query);
      return nameMatch || roleMatch;
    });

    const groups: { [key: string]: StaffReportItem[] } = {};

    reports.forEach((staff) => {
      const role = (staff.role_name || "General").trim();
      if (!groups[role]) {
        groups[role] = [];
      }
      groups[role].push(staff);
    });

    return groups;
  }, [item, searchQuery]);

  if (!isOpen || !item) return null;

  const totalStaff = item.total_staffs_count ?? item.staff_reports?.length ?? 0;
  const filteredStaffCount = Object.values(groupedStaff).reduce(
    (acc, list) => acc + list.length,
    0
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl md:max-w-3xl bg-white shadow-2xl flex flex-col border-l border-slate-200/90 animate-in slide-in-from-right duration-300">
          
          {/* 1. Drawer Header */}
          <div className="p-5 sm:p-6 border-b border-slate-200/80 bg-slate-50/50 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    {item.name || dateRangeStr}
                  </h2>
                  <span className="text-xs font-bold text-slate-600 bg-slate-200/70 px-2.5 py-0.5 rounded-full">
                    {totalStaff} staff
                  </span>
                </div>
                {dateRangeStr && (
                  <p className="text-xs font-semibold text-slate-500">
                    {dateRangeStr}
                  </p>
                )}
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-full transition-all cursor-pointer shadow-2xs"
                title="Close Drawer (Esc)"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Stat Summary Cards inside Header */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
              <div className="bg-white border border-slate-200/80 rounded-xl p-2 text-center shadow-2xs">
                <span className="block text-[9px] font-extrabold text-slate-400 uppercase">Working</span>
                <span className="text-sm font-black text-slate-900">{item.total_working_days}</span>
              </div>
              <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-2 text-center shadow-2xs">
                <span className="block text-[9px] font-extrabold text-emerald-700 uppercase">Present</span>
                <span className="text-sm font-black text-emerald-600">{item.presents}</span>
              </div>
              <div className="bg-rose-50/80 border border-rose-200/80 rounded-xl p-2 text-center shadow-2xs">
                <span className="block text-[9px] font-extrabold text-rose-700 uppercase">Absent</span>
                <span className="text-sm font-black text-rose-600">{item.absents}</span>
              </div>
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-2 text-center shadow-2xs">
                <span className="block text-[9px] font-extrabold text-amber-700 uppercase">Leave</span>
                <span className="text-sm font-black text-amber-600">{item.leave}</span>
              </div>
              <div className="bg-purple-50/80 border border-purple-200/80 rounded-xl p-2 text-center shadow-2xs">
                <span className="block text-[9px] font-extrabold text-purple-700 uppercase">Holiday</span>
                <span className="text-sm font-black text-purple-600">{item.holiday}</span>
              </div>
              <div className="bg-sky-50/80 border border-sky-200/80 rounded-xl p-2 text-center shadow-2xs">
                <span className="block text-[9px] font-extrabold text-sky-700 uppercase">Half Day</span>
                <span className="text-sm font-black text-sky-600">{item.halfday}</span>
              </div>
            </div>

            {/* Quick Staff Search Filter Bar */}
            <div className="relative pt-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter staff by name or department role..."
                className="w-full pl-9 pr-8 h-9 text-xs bg-white border border-slate-200/90 rounded-xl focus:outline-none focus:border-indigo-600 font-semibold text-slate-700 shadow-2xs transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* 2. Drawer Body (Scrollable Staff Breakdown) */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {Object.keys(groupedStaff).length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center border border-slate-200">
                  <Users size={22} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-700">No staff members found</h4>
                  <p className="text-xs text-slate-400">
                    {searchQuery
                      ? `No staff matching "${searchQuery}"`
                      : "No staff records available for this period."}
                  </p>
                </div>
              </div>
            ) : (
              Object.entries(groupedStaff).map(([roleName, staffList]) => (
                <div key={roleName} className="space-y-2.5">
                  {/* Role Header */}
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      {roleName}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      {staffList.length} staff
                    </span>
                  </div>

                  {/* Staff Table */}
                  <div className="overflow-x-auto w-full rounded-xl border border-slate-100 bg-white">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          <th className="py-2.5 px-3">STAFF</th>
                          <th className="py-2.5 px-3 text-right">WORKING DAYS</th>
                          <th className="py-2.5 px-3 text-right">PRESENT</th>
                          <th className="py-2.5 px-3 text-right">ABSENT</th>
                          <th className="py-2.5 px-3 text-right">LEAVE</th>
                          <th className="py-2.5 px-3 text-right">HOLIDAY</th>
                          <th className="py-2.5 px-3 text-right">HALF DAY</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dashed divide-slate-200/70 text-xs">
                        {staffList.map((staff) => (
                          <tr key={staff.staff_id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-3 font-extrabold text-slate-800">
                              {staff.staff_name}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-700">
                              {staff.total_working_days}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span
                                className={
                                  staff.presents > 0
                                    ? "font-extrabold text-emerald-600"
                                    : "font-normal text-slate-400"
                                }
                              >
                                {staff.presents}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span
                                className={
                                  staff.absents > 0
                                    ? "font-extrabold text-rose-600"
                                    : "font-normal text-slate-400"
                                }
                              >
                                {staff.absents}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span
                                className={
                                  staff.leave > 0
                                    ? "font-extrabold text-amber-600"
                                    : "font-normal text-slate-400"
                                }
                              >
                                {staff.leave}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span
                                className={
                                  staff.holiday > 0
                                    ? "font-extrabold text-purple-600"
                                    : "font-normal text-slate-400"
                                }
                              >
                                {staff.holiday}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span
                                className={
                                  staff.halfday > 0
                                    ? "font-extrabold text-sky-600"
                                    : "font-normal text-slate-400"
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

          {/* 3. Drawer Footer */}
          <div className="p-4 border-t border-slate-200/80 bg-slate-50/60 flex items-center justify-between text-xs font-semibold text-slate-500">
            <div>
              Showing <span className="font-extrabold text-slate-800">{filteredStaffCount}</span> of{" "}
              <span className="font-extrabold text-slate-800">{totalStaff}</span> staff members
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              Done
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

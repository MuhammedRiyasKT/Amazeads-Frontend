// src/modules/hr/pages/HRAttendancePage.tsx

"use client";

import React, { useState } from "react";
import { CalendarDays, Calendar } from "lucide-react";
import DailyAttendanceTab from "../components/DailyAttendanceTab";
import HolidaysTab from "../components/HolidaysTab";

export default function HRAttendancePage() {
  const [activeTab, setActiveTab] = useState<"daily" | "holidays">("daily");

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CalendarDays className="text-indigo-600" size={26} />
            Attendance
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Daily staff attendance and attendance management
          </p>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/80 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("daily")}
            className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "daily"
                ? "bg-white text-indigo-600 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CalendarDays size={15} />
            Daily Attendance
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("holidays")}
            className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "holidays"
                ? "bg-white text-indigo-600 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calendar size={15} />
            Holidays
          </button>
        </div>
      </div>

      {/* Active Tab View */}
      {activeTab === "daily" ? <DailyAttendanceTab /> : <HolidaysTab />}
    </div>
  );
}

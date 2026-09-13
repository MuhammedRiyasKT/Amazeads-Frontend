// src/modules/attendance-report/components/AttendanceSummaryCards.tsx

"use client";

import React from "react";
import { UserCheck, UserX, Clock, CalendarDays, Palmtree, Briefcase } from "lucide-react";
import { AttendanceReportItem } from "../types/attendanceReport.types";

interface AttendanceSummaryCardsProps {
  summaryItem: AttendanceReportItem | null;
  periodName?: string;
  isLoading?: boolean;
}

export default function AttendanceSummaryCards({
  summaryItem,
  periodName,
  isLoading,
}: AttendanceSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5 w-full">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="h-24 bg-slate-100 rounded-2xl animate-pulse border border-slate-200/60"
          />
        ))}
      </div>
    );
  }

  const presents = summaryItem?.presents ?? 0;
  const absents = summaryItem?.absents ?? 0;
  const halfday = summaryItem?.halfday ?? 0;
  const leave = summaryItem?.leave ?? 0;
  const holiday = summaryItem?.holiday ?? 0;
  const totalWorkingDays = summaryItem?.total_working_days ?? 0;

  const cards = [
    {
      title: "PRESENT",
      value: presents,
      icon: UserCheck,
      bgColor: "bg-emerald-50/70",
      textColor: "text-emerald-700",
      iconColor: "text-emerald-600",
      borderColor: "border-emerald-200/80",
    },
    {
      title: "ABSENT",
      value: absents,
      icon: UserX,
      bgColor: "bg-rose-50/70",
      textColor: "text-rose-700",
      iconColor: "text-rose-600",
      borderColor: "border-rose-200/80",
    },
    {
      title: "HALF DAY",
      value: halfday,
      icon: Clock,
      bgColor: "bg-amber-50/70",
      textColor: "text-amber-700",
      iconColor: "text-amber-600",
      borderColor: "border-amber-200/80",
    },
    {
      title: "LEAVE",
      value: leave,
      icon: CalendarDays,
      bgColor: "bg-blue-50/70",
      textColor: "text-blue-700",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200/80",
    },
    {
      title: "HOLIDAY",
      value: holiday,
      icon: Palmtree,
      bgColor: "bg-purple-50/70",
      textColor: "text-purple-700",
      iconColor: "text-purple-600",
      borderColor: "border-purple-200/80",
    },
    {
      title: "WORKING DAYS",
      value: totalWorkingDays,
      icon: Briefcase,
      bgColor: "bg-slate-100/80",
      textColor: "text-slate-800",
      iconColor: "text-slate-600",
      borderColor: "border-slate-300/80",
    },
  ];

  return (
    <div className="space-y-2 w-full">
      {periodName && (
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
            Summary Overview ({periodName})
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5 w-full">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`p-3.5 rounded-2xl border ${card.bgColor} ${card.borderColor} shadow-2xs transition-all hover:scale-[1.01]`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-1.5 rounded-lg bg-white/80 shadow-2xs ${card.iconColor}`}>
                  <Icon size={14} />
                </div>
              </div>

              <div className={`text-2xl font-black ${card.textColor} tracking-tight`}>
                {card.value.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

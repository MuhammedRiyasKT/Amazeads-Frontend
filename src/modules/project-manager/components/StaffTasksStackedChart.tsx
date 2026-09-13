// src/modules/project-manager/components/StaffTasksStackedChart.tsx

"use client";

import React, { useState } from "react";

export interface StaffTaskItem {
  staff_id: number;
  staff_name: string;
  role_id?: number;
  role_name?: string;
  total_assigned_tasks?: number;
  completed_tasks: number;
  not_completed_tasks: number;
  not_accepted_tasks: number;
  in_progress_tasks?: number;
}

interface StaffTasksStackedChartProps {
  data: StaffTaskItem[];
  isLoading?: boolean;
}

export default function StaffTasksStackedChart({
  data,
  isLoading = false,
}: StaffTasksStackedChartProps) {
  const [hoveredInfo, setHoveredInfo] = useState<{
    staffName: string;
    label: string;
    value: number;
    x: number;
    y: number;
  } | null>(null);

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3 min-h-[340px] sm:min-h-[360px] lg:min-h-[380px] flex flex-col justify-between">
        <div className="h-4 w-36 bg-slate-100 rounded animate-pulse" />
        <div className="h-3 w-64 bg-slate-100 rounded animate-pulse mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-3 animate-pulse">
              <div className="h-3.5 w-20 bg-slate-100 rounded" />
              <div className="h-5 flex-1 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Filter staff with > 0 total tasks and sort descending
  const activeStaff = data
    .map((s) => {
      const completed = s.completed_tasks || 0;
      const notCompleted = s.not_completed_tasks || 0;
      const notAccepted = s.not_accepted_tasks || 0;
      const total = completed + notCompleted + notAccepted;
      return {
        ...s,
        completed,
        notCompleted,
        notAccepted,
        total,
      };
    })
    .filter((s) => s.total > 0)
    .sort((a, b) => b.total - a.total);

  const maxTotal = Math.max(...activeStaff.map((s) => s.total), 1);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-2xs relative h-[350px] sm:h-[370px] flex flex-col justify-between overflow-hidden space-y-2">
      {/* Header */}
      <div className="space-y-0.5 border-b border-slate-100 pb-2 shrink-0">
        <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
          Tasks by staff
        </h3>
        <p className="text-xs font-bold text-slate-400">
          Completed, not completed and not accepted, per person
        </p>
      </div>

      {activeStaff.length === 0 ? (
        <div className="py-12 text-center text-xs font-semibold text-slate-400">
          No staff task data available for this timeframe.
        </div>
      ) : (
        /* Scrollable Roster Container */
        <div className="flex-1 overflow-y-auto pr-2 space-y-2.5 scrollbar-thin my-1">
          {activeStaff.map((staff) => {
            const barWidthPercent = (staff.total / maxTotal) * 100;
            const completedPct = (staff.completed / staff.total) * 100;
            const notCompletedPct = (staff.notCompleted / staff.total) * 100;
            const notAcceptedPct = (staff.notAccepted / staff.total) * 100;

            return (
              <div key={staff.staff_id || staff.staff_name} className="flex items-center gap-3 group text-xs">
                {/* Staff Name */}
                <div className="w-24 text-left font-extrabold text-slate-800 truncate shrink-0">
                  {staff.staff_name}
                </div>

                {/* Stacked Horizontal Bar */}
                <div className="flex-1 bg-slate-50 h-5 rounded-xs overflow-hidden flex items-center">
                  <div
                    className="h-full flex rounded-xs overflow-hidden transition-all duration-300"
                    style={{ width: `${Math.max(barWidthPercent, 3)}%` }}
                  >
                    {/* Completed (Emerald Green) */}
                    {staff.completed > 0 && (
                      <div
                        style={{
                          width: `${completedPct}%`,
                          backgroundColor: "#10b981",
                        }}
                        className="h-full transition-opacity hover:opacity-85 cursor-pointer"
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredInfo({
                            staffName: staff.staff_name,
                            label: "Completed",
                            value: staff.completed,
                            x: rect.left + rect.width / 2,
                            y: rect.top - 8,
                          });
                        }}
                        onMouseLeave={() => setHoveredInfo(null)}
                      />
                    )}

                    {/* Not completed (Amber Yellow) */}
                    {staff.notCompleted > 0 && (
                      <div
                        style={{
                          width: `${notCompletedPct}%`,
                          backgroundColor: "#f59e0b",
                        }}
                        className="h-full transition-opacity hover:opacity-85 cursor-pointer"
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredInfo({
                            staffName: staff.staff_name,
                            label: "Not completed",
                            value: staff.notCompleted,
                            x: rect.left + rect.width / 2,
                            y: rect.top - 8,
                          });
                        }}
                        onMouseLeave={() => setHoveredInfo(null)}
                      />
                    )}

                    {/* Not accepted (Crimson Red) */}
                    {staff.notAccepted > 0 && (
                      <div
                        style={{
                          width: `${notAcceptedPct}%`,
                          backgroundColor: "#ef4444",
                        }}
                        className="h-full transition-opacity hover:opacity-85 cursor-pointer"
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredInfo({
                            staffName: staff.staff_name,
                            label: "Not accepted",
                            value: staff.notAccepted,
                            x: rect.left + rect.width / 2,
                            y: rect.top - 8,
                          });
                        }}
                        onMouseLeave={() => setHoveredInfo(null)}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Hover Tooltip */}
      {hoveredInfo && (
        <div
          className="fixed z-50 pointer-events-none bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xl -translate-x-1/2 -translate-y-full border border-slate-700"
          style={{ top: hoveredInfo.y, left: hoveredInfo.x }}
        >
          <span>{hoveredInfo.staffName}: {hoveredInfo.label} ({hoveredInfo.value})</span>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 pt-2 border-t border-slate-100 text-xs font-black text-slate-600 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-xs inline-block" style={{ backgroundColor: "#10b981" }} />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-xs inline-block" style={{ backgroundColor: "#f59e0b" }} />
          <span>Not completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-xs inline-block" style={{ backgroundColor: "#ef4444" }} />
          <span>Not accepted</span>
        </div>
      </div>
    </div>
  );
}

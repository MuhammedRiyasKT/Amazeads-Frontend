// src/modules/project-manager/components/StaffTasksStackedChart.tsx

"use client";

import React, { useState } from "react";

export interface StaffTaskItem {
  staff_id: number;
  staff_name: string;
  role_id?: number;
  role_name?: string;
  department_name?: string;
  department?: string;
  total_assigned_tasks?: number;
  completed_tasks: number;
  not_completed_tasks: number;
  not_accepted_tasks: number;
  in_progress_tasks?: number;
}

export function getStaffDepartment(staff: StaffTaskItem): string {
  const rawRole = (staff.role_name || staff.department_name || staff.department || "").toLowerCase().trim();

  if (rawRole.includes("design")) return "Designing";
  if (rawRole.includes("print") || rawRole.includes("operat")) return "Printing";
  if (rawRole.includes("product")) return "Production";
  if (rawRole.includes("logistic") || rawRole.includes("courier") || rawRole.includes("dispatch")) return "Logistics";

  if (staff.role_id === 1) return "Designing";
  if (staff.role_id === 2) return "Printing";
  if (staff.role_id === 3) return "Production";
  if (staff.role_id === 4) return "Logistics";

  if (staff.role_name) {
    return staff.role_name.charAt(0).toUpperCase() + staff.role_name.slice(1);
  }
  return "";
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
    department?: string;
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
            const staffDept = getStaffDepartment(staff);

            return (
              <div key={staff.staff_id || staff.staff_name} className="flex items-center gap-3 group text-xs">
                {/* Staff Name & Department */}
                <div
                  className="w-28 sm:w-32 text-left shrink-0 cursor-default"
                  title={`${staff.staff_name}${staffDept ? ` (${staffDept})` : ""}`}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredInfo({
                      staffName: staff.staff_name,
                      department: staffDept,
                      label: "Total Tasks",
                      value: staff.total,
                      x: rect.left + rect.width / 2,
                      y: rect.top - 8,
                    });
                  }}
                  onMouseLeave={() => setHoveredInfo(null)}
                >
                  <div className="font-extrabold text-slate-800 truncate text-xs">
                    {staff.staff_name}
                  </div>
                  {staffDept && (
                    <div className="text-[10px] font-semibold text-slate-400 truncate">
                      {staffDept}
                    </div>
                  )}
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
                        title={`${staff.staff_name}${staffDept ? ` (${staffDept})` : ""} - Completed: ${staff.completed}`}
                        className="h-full transition-opacity hover:opacity-85 cursor-pointer"
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredInfo({
                            staffName: staff.staff_name,
                            department: staffDept,
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
                        title={`${staff.staff_name}${staffDept ? ` (${staffDept})` : ""} - Not completed: ${staff.notCompleted}`}
                        className="h-full transition-opacity hover:opacity-85 cursor-pointer"
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredInfo({
                            staffName: staff.staff_name,
                            department: staffDept,
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
                        title={`${staff.staff_name}${staffDept ? ` (${staffDept})` : ""} - Not accepted: ${staff.notAccepted}`}
                        className="h-full transition-opacity hover:opacity-85 cursor-pointer"
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredInfo({
                            staffName: staff.staff_name,
                            department: staffDept,
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
          className="fixed z-50 pointer-events-none bg-slate-900 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg shadow-xl -translate-x-1/2 -translate-y-full border border-slate-700/80 flex flex-col gap-0.5"
          style={{ top: hoveredInfo.y, left: hoveredInfo.x }}
        >
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-white">{hoveredInfo.staffName}</span>
            {hoveredInfo.department && (
              <span className="text-[9.5px] px-1.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded font-semibold">
                {hoveredInfo.department}
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-300">
            <span>{hoveredInfo.label}: </span>
            <span className="font-bold text-white">{hoveredInfo.value}</span>
          </div>
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

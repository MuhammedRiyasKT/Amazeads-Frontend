"use client";

import React from "react";
import { X, Calendar, AlertCircle, Info } from "lucide-react";
import Button from "@/components/ui/Button";
import { PersonalAssignment } from "../services/profile.service";

interface ViewAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: PersonalAssignment | null;
}

// ─── Date Formatter Helper ──────────────────────────────────────────────────
function formatAssignmentPeriod(startDateStr: string, endDateStr: string): string {
  if (!startDateStr) return "—";
  
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      
      const day = String(date.getDate()).padStart(2, "0");
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = monthNames[date.getMonth()];
      return `${day} ${month}`;
    } catch {
      return dateStr;
    }
  };

  const formattedStart = formatDate(startDateStr);
  if (!endDateStr || startDateStr === endDateStr) {
    return formattedStart;
  }
  
  const formattedEnd = formatDate(endDateStr);
  return `${formattedStart} – ${formattedEnd}`;
}

export default function ViewAssignmentModal({ isOpen, onClose, assignment }: ViewAssignmentModalProps) {
  if (!isOpen || !assignment) return null;

  const getDayLabel = (dayNum: number) => {
    const days = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return days[dayNum] || "";
  };

  const getPriorityText = (priority: number) => {
    if (priority === 3) return "High";
    if (priority === 2) return "Medium";
    return "Low";
  };

  const getStatusText = (status: string) => {
    if (!status) return "—";
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  return (
    <div 
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "16px"
      }}
    >
      <div 
        style={{
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          padding: "28px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
          boxSizing: "border-box"
        }}
      >
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3">
          <h2 className="text-lg font-bold text-slate-900">Task Details</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4 text-left">
          {/* Task Info */}
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Task Name</span>
            <h3 className="text-base font-bold text-slate-900 mt-1">{assignment.task_name}</h3>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed whitespace-pre-wrap">{assignment.task_description || "No description provided."}</p>
          </div>

          <div className="border-t border-slate-100 my-1" />

          {/* Dates & Status Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Assignment Period</span>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mt-1">
                <Calendar size={15} className="text-slate-400" /> {formatAssignmentPeriod(assignment.start_date, assignment.end_date)}
              </div>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Assignment Status</span>
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 mt-1">
                <Info size={15} className="text-indigo-400" /> {getStatusText(assignment.assignment_status)}
              </div>
            </div>
          </div>

          {/* Priority & Scheduled Days */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Priority</span>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mt-1">
                <AlertCircle size={15} className="text-slate-400" /> {getPriorityText(assignment.priority)}
              </div>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Scheduled Days</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {assignment.scheduled_days && assignment.scheduled_days.length > 0 ? (
                  assignment.scheduled_days.map((dayNum) => (
                    <span key={dayNum} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                      {getDayLabel(dayNum)}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold">All Days</span>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 my-1" />

          {/* Task Progress Summary */}
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Task Progress Summary</span>
            <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100 text-center text-xs mt-2">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block truncate">Scheduled</span>
                <span className="font-extrabold text-slate-800 text-sm block mt-0.5">
                  {assignment.total_scheduled_in_range === 0 ? "—" : assignment.total_scheduled_in_range}
                </span>
              </div>
              <div className="border-l border-slate-200">
                <span className="text-[9px] uppercase font-bold text-slate-400 block truncate">Completed</span>
                <span className="font-extrabold text-emerald-600 text-sm block mt-0.5">
                  {assignment.completed_count}
                </span>
              </div>
              <div className="border-l border-slate-200">
                <span className="text-[9px] uppercase font-bold text-slate-400 block truncate">Pending</span>
                <span className="font-extrabold text-amber-600 text-sm block mt-0.5">
                  {assignment.pending_count}
                </span>
              </div>
              <div className="border-l border-slate-200">
                <span className="text-[9px] uppercase font-bold text-slate-400 block truncate">Overdue</span>
                <span className="font-extrabold text-rose-600 text-sm block mt-0.5">
                  {assignment.overdue_count ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
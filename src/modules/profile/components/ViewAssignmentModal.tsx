"use client";

import React from "react";
import { X, Calendar, ClipboardList, User, Shield, AlertCircle, Info } from "lucide-react";
import Button from "@/components/ui/Button";
import { PersonalAssignment } from "../services/profile.service";
import styles from "./ProfileComponents.module.css";

interface ViewAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: PersonalAssignment | null;
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
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">{assignment.task_description}</p>
          </div>

          <div className="border-t border-slate-100 my-1" />

          {/* Staff Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Staff Name</span>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mt-1">
                <User size={15} /> {assignment.staff_name}
              </div>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Role / Designation</span>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mt-1">
                <Shield size={15} /> {assignment.role_name}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Start Date</span>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mt-1">
                <Calendar size={15} /> {assignment.start_date}
              </div>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">End Date</span>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mt-1">
                <Calendar size={15} /> {assignment.end_date}
              </div>
            </div>
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Priority</span>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mt-1">
                <AlertCircle size={15} /> {getPriorityText(assignment.priority)}
              </div>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Assignment Status</span>
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 mt-1">
                <Info size={15} /> {assignment.assignment_status.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Scheduled Days */}
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Scheduled Days</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {assignment.scheduled_days && assignment.scheduled_days.length > 0 ? (
                assignment.scheduled_days.map((dayNum) => (
                  <span key={dayNum} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-semibold">
                    {getDayLabel(dayNum)}
                  </span>
                ))
              ) : (
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-semibold">All Days</span>
              )}
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
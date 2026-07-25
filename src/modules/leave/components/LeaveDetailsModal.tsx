"use client";

import React from "react";
import { X, Calendar, User, AlignLeft, ShieldCheck } from "lucide-react";
import { LeaveRequest } from "../types";

interface LeaveDetailsModalProps {
  isOpen: boolean;
  leave: LeaveRequest | null;
  onClose: () => void;
}

export default function LeaveDetailsModal({ isOpen, leave, onClose }: LeaveDetailsModalProps) {
  if (!isOpen || !leave) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-sm uppercase">Leave Application Details</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={18} /></button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4 text-sm text-slate-600">
          {/* Staff Info */}
          <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <User className="text-indigo-600 mt-0.5" size={18} />
            <div>
              <h4 className="font-bold text-slate-800 text-sm">{leave.staff_name || "Employee"}</h4>
              <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5">{leave.staff_role || `ID: ${leave.staff_id}`}</p>
            </div>
          </div>

          {/* Leave Type and Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Leave Type</span>
              <span className="font-semibold text-slate-800 text-xs bg-indigo-50/60 text-indigo-700 px-2 py-1 rounded w-fit border border-indigo-100/50">{leave.leave_type}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
              <span className="font-bold text-slate-800 text-xs">{leave.status}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1 border-t pt-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Calendar size={12}/> Dates</span>
            <span className="font-semibold text-slate-800">{leave.from_date} <span className="text-slate-400 font-normal">to</span> {leave.to_date}</span>
          </div>

          {/* Reason */}
          <div className="flex flex-col gap-1 border-t pt-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><AlignLeft size={12}/> Reason</span>
            <p className="text-slate-700 bg-slate-50/50 p-3 rounded-lg border border-slate-100 italic">"{leave.reason}"</p>
          </div>

          {/* Approval Workflow Tracking */}
          <div className="flex flex-col gap-2 border-t pt-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><ShieldCheck size={12}/> Approvals Tracking</span>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-50 border p-2 rounded-lg">
                <span className="font-bold block text-slate-400 text-[10px] uppercase">Manager</span>
                <span className={`font-bold ${leave.manager_approved_by ? "text-emerald-600" : "text-slate-500"}`}>{leave.manager_approved_by ? "Approved" : "Pending"}</span>
              </div>
              <div className="bg-slate-50 border p-2 rounded-lg">
                <span className="font-bold block text-slate-400 text-[10px] uppercase">HR</span>
                <span className={`font-bold ${leave.hr_approved_by ? "text-emerald-600" : "text-slate-500"}`}>{leave.hr_approved_by ? "Approved" : "Pending"}</span>
              </div>
              <div className="bg-slate-50 border p-2 rounded-lg">
                <span className="font-bold block text-slate-400 text-[10px] uppercase">Admin</span>
                <span className={`font-bold ${leave.admin_approved_by ? "text-emerald-600" : "text-slate-500"}`}>{leave.admin_approved_by ? "Approved" : "Pending"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
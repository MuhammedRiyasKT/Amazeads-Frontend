"use client";

import React, { useState } from "react";
import { X, Calendar, FileText } from "lucide-react";
import Button from "@/components/ui/Button";
import { LeaveType, CreateLeavePayload } from "../types";

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateLeavePayload) => void;
}

export default function ApplyLeaveModal({ isOpen, onClose, onSubmit }: ApplyLeaveModalProps) {
  const [leaveType, setLeaveType] = useState<LeaveType>("Casual");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate || !reason.trim()) {
      alert("Please fill all required fields");
      return;
    }
    onSubmit({
      leave_type: leaveType,
      from_date: fromDate,
      to_date: toDate,
      reason: reason.trim(),
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[1000] p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-lg">Apply for Leave</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {/* Leave Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Leave Type</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as LeaveType)}
              className="w-full h-10 border border-slate-200 rounded-lg px-3 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-950/5"
            >
              <option value="Casual">Casual Leave</option>
              <option value="Sick">Sick Leave</option>
              <option value="Paid">Paid Leave</option>
              <option value="Unpaid">Unpaid Leave</option>
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">From Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Reason */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reason</label>
            <textarea
              placeholder="State your reason for leave..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full min-h-[100px] border border-slate-200 rounded-lg p-3 text-sm focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Submit Application
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
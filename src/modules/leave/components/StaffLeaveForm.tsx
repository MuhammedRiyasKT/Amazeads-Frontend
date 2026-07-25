"use client";

import React, { useState } from "react";
import { Calendar, FileText, Send } from "lucide-react";
import Button from "@/components/ui/Button";
import { LeaveType, CreateLeavePayload } from "../types";

interface StaffLeaveFormProps {
  onSubmit: (payload: CreateLeavePayload) => Promise<void>;
  isSubmitting: boolean;
}

export default function StaffLeaveForm({ onSubmit, isSubmitting }: StaffLeaveFormProps) {
  const [leaveType, setLeaveType] = useState<LeaveType>("Casual");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate || !reason.trim()) {
      alert("Please fill in all fields.");
      return;
    }
    
    await onSubmit({
      leave_type: leaveType,
      from_date: fromDate,
      to_date: toDate,
      reason: reason.trim()
    });

    // Form reset ചെയ്യുക
    setFromDate("");
    setToDate("");
    setReason("");
  };

  return (
    <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
          <Calendar size={18} />
        </div>
        <h3 className="font-bold text-slate-800 text-base">New Leave Application</h3>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Leave Type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Leave Type</label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value as LeaveType)}
            className="w-full h-10 border border-slate-200 rounded-lg px-3 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
          >
            <option value="Casual">Casual Leave</option>
            <option value="Sick">Sick Leave</option>
            <option value="Paid">Paid Leave</option>
            <option value="Unpaid">Unpaid Leave</option>
          </select>
        </div>

        {/* Date Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
              required
            />
          </div>
        </div>

        {/* Reason for Leave */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reason</label>
          <div className="relative">
            <textarea
              rows={4}
              placeholder="Provide a reason for leave..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
              required
            />
          </div>
        </div>

        <Button 
          variant="primary" 
          size="md" 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full flex items-center justify-center gap-2 mt-2"
        >
          <Send size={16} /> 
          {isSubmitting ? "Submitting..." : "Submit Leave Application"}
        </Button>
      </form>
    </div>
  );
}
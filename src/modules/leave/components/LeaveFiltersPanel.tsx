"use client";

import React from "react";
import { Search, Filter, Calendar } from "lucide-react";

interface LeaveFiltersPanelProps {
  staffId: string;
  setStaffId: (val: string) => void;
  leaveType: string;
  setLeaveType: (val: string) => void;
  fromDate: string;
  setFromDate: (val: string) => void;
  toDate: string;
  setToDate: (val: string) => void;
  approvalFilter: string;
  setApprovalFilter: (val: string) => void;
  onApply: () => void;
  onClear: () => void;
}

export default function LeaveFiltersPanel({
  staffId, setStaffId,
  leaveType, setLeaveType,
  fromDate, setFromDate,
  toDate, setToDate,
  approvalFilter, setApprovalFilter,
  onApply, onClear
}: LeaveFiltersPanelProps) {
  return (
    <div className="bg-white border rounded-xl p-5 shadow-sm flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {/* Search by Staff ID */}
        <div className="relative">
          <input
            type="number"
            placeholder="Staff ID..."
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            className="w-full h-10 border border-slate-200 rounded-lg pl-9 pr-3 text-xs focus:outline-none"
          />
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
        </div>

        {/* Leave Type Select */}
        <select
          value={leaveType}
          onChange={(e) => setLeaveType(e.target.value)}
          className="h-10 border border-slate-200 rounded-lg px-3 bg-white text-xs focus:outline-none"
        >
          <option value="">All Leave Types</option>
          <option value="Casual">Casual</option>
          <option value="Sick">Sick</option>
          <option value="Paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
        </select>

        {/* Start Date */}
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="h-10 border border-slate-200 rounded-lg px-3 text-xs focus:outline-none"
        />

        {/* End Date */}
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="h-10 border border-slate-200 rounded-lg px-3 text-xs focus:outline-none"
        />

        {/* Approval status filter */}
        <select
          value={approvalFilter}
          onChange={(e) => setApprovalFilter(e.target.value)}
          className="h-10 border border-slate-200 rounded-lg px-3 bg-white text-xs focus:outline-none"
        >
          <option value="">All Approvals</option>
          <option value="manager_approved">Manager Approved</option>
          <option value="hr_approved">HR Approved</option>
          <option value="admin_approved">Admin Approved</option>
        </select>
      </div>

      <div className="flex justify-end gap-2.5">
        <button onClick={onClear} className="px-4 py-2 border rounded-lg hover:bg-slate-50 text-xs font-semibold cursor-pointer">
          Clear Filters
        </button>
        <button onClick={onApply} className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1">
          <Filter size={12} /> Apply Filters
        </button>
      </div>
    </div>
  );
}
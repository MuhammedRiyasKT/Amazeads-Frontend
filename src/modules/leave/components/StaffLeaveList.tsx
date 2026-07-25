"use client";

import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Eye } from "lucide-react";
import { LeaveRequest, LeaveStatus } from "../types";
import LeaveDetailsModal from "./LeaveDetailsModal";

interface StaffLeaveListProps {
  leaves: LeaveRequest[];
  isLoading: boolean;
}

export default function StaffLeaveList({ leaves, isLoading }: StaffLeaveListProps) {
  // Modal states
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusStyle = (status: LeaveStatus) => {
    let displayStatus = status;
    if (status === "Manager Approved" || status === "HR Approved" || status === "Pending") {
      displayStatus = "Pending";
    }
    switch (displayStatus) {
      case "Approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Rejected":
        return "bg-rose-50 text-rose-700 border-rose-100";
      default:
        return "bg-amber-50 text-amber-700 border-amber-100";
    }
  };

  const getLeaveTypeStyle = (type: string) => {
    const styles: Record<string, string> = {
      Casual: "bg-indigo-50 text-indigo-700 border-indigo-100",
      Sick: "bg-pink-50 text-pink-700 border-pink-100",
      Paid: "bg-teal-50 text-teal-700 border-teal-100",
      Unpaid: "bg-slate-100 text-slate-700 border-slate-200",
    };
    return styles[type] || "bg-slate-50 text-slate-600";
  };

  const renderHRStatus = (leave: LeaveRequest) => {
    if (leave.status === "Pending") {
      return <span className="text-xs text-amber-600 font-semibold bg-amber-50/50 px-2.5 py-0.5 rounded border border-amber-100/50 animate-pulse">Pending Review</span>;
    }
    if (leave.status === "Rejected" && !leave.hr_approved_by) {
      return <span className="text-xs text-rose-600 font-bold bg-rose-50/50 px-2.5 py-0.5 rounded border">HR Rejected</span>;
    }
    if (leave.hr_approved_by) {
      return (
        <div className="flex flex-col">
          <span className="text-xs text-sky-600 font-bold">HR Approved</span>
          {leave.hr_approved_at && (
            <span className="text-[10px] text-slate-400 mt-0.5">{new Date(leave.hr_approved_at).toLocaleDateString()}</span>
          )}
        </div>
      );
    }
    return <span className="text-slate-400 text-xs font-medium">—</span>;
  };

  const renderManagerAndAdminStatus = (leave: LeaveRequest) => {
    if (leave.status === "Pending") {
      return <span className="text-xs text-slate-400 font-medium">Waiting for HR</span>;
    }
    if (leave.admin_approved_by) {
      if (leave.status === "Approved") {
        return (
          <div className="flex flex-col">
            <span className="text-xs text-emerald-600 font-bold">Admin Approved</span>
            {leave.admin_approved_at && (
              <span className="text-[10px] text-slate-400 mt-0.5">{new Date(leave.admin_approved_at).toLocaleDateString()}</span>
            )}
          </div>
        );
      }
      if (leave.status === "Rejected") {
        return <span className="text-xs text-rose-600 font-bold bg-rose-50/50 px-2.5 py-0.5 rounded border">Admin Rejected</span>;
      }
    }
    if (leave.manager_approved_by) {
      return (
        <div className="flex flex-col">
          <span className="text-xs text-indigo-600 font-bold">Manager Approved</span>
          {leave.manager_approved_at && (
            <span className="text-[10px] text-slate-400 mt-0.5">{new Date(leave.manager_approved_at).toLocaleDateString()}</span>
          )}
        </div>
      );
    }
    if (leave.status === "HR Approved") {
      return <span className="text-xs text-amber-600 font-semibold bg-amber-50/50 px-2.5 py-0.5 rounded border border-amber-100/50 animate-pulse">Pending Review</span>;
    }
    if (leave.status === "Rejected" && leave.hr_approved_by && !leave.admin_approved_by && !leave.manager_approved_by) {
      return <span className="text-xs text-rose-600 font-bold bg-rose-50/50 px-2.5 py-0.5 rounded border">Manager Rejected</span>;
    }
    return <span className="text-slate-400 text-xs font-medium">—</span>;
  };

  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 text-sm">My Leave History</h3>
        <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2.5 py-1 rounded-full">
          Total: {leaves.length} Applications
        </span>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead style={{ width: "120px" }}>Leave Type</TableHead>
              <TableHead style={{ width: "140px" }}>Final Status</TableHead>
              <TableHead style={{ width: "180px" }}>HR Status</TableHead>
              <TableHead style={{ width: "240px" }}>Manager & Admin Status</TableHead>
              <TableHead style={{ width: "140px", textAlign: "center" }}>Reason</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Loading applications...</TableCell></TableRow>
            ) : leaves.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">No leave requests found.</TableCell></TableRow>
            ) : (
              leaves.map((leave) => {
                let finalDisplayStatus = leave.status;
                if (leave.status === "Manager Approved" || leave.status === "HR Approved" || leave.status === "Pending") {
                  finalDisplayStatus = "Pending";
                }

                return (
                  <TableRow key={leave.id}>
                    <TableCell>
                      <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md border ${getLeaveTypeStyle(leave.leave_type)}`}>
                        {leave.leave_type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${getStatusStyle(leave.status)}`}>
                        {finalDisplayStatus}
                      </span>
                    </TableCell>
                    <TableCell>{renderHRStatus(leave)}</TableCell>
                    <TableCell>{renderManagerAndAdminStatus(leave)}</TableCell>
                    
                    {/* Reason Column (View details button) */}
                    <TableCell className="text-center">
                      <button
                        onClick={() => { setSelectedLeave(leave); setIsModalOpen(true); }}
                        className="inline-flex items-center gap-1.5 text-[11px] text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50/50 hover:bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 transition-all cursor-pointer"
                      >
                        <Eye size={12} /> View Reason
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <LeaveDetailsModal isOpen={isModalOpen} leave={selectedLeave} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
"use client";

import React from "react";
import { Check, X, Clock, ShieldAlert } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import { LeaveRequest, LeaveStatus } from "../types";

interface LeaveTableProps {
  leaves: LeaveRequest[];
  currentUserRole: string;
  onApprove?: (leaveId: number) => void;
  onReject?: (leaveId: number) => void;
  isLoading?: boolean;
}

export default function LeaveTable({
  leaves,
  currentUserRole,
  onApprove,
  onReject,
  isLoading
}: LeaveTableProps) {
  const isHR = currentUserRole.toLowerCase() === "hr";
  const isAdmin = currentUserRole.toLowerCase() === "admin";
  const canApprove = isHR || isAdmin;

  const getStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case "Approved":
        return <span className="px-2.5 py-1 text-xs font-bold bg-green-50 text-green-700 rounded-md border border-green-100">Approved</span>;
      case "HR Approved":
        return <span className="px-2.5 py-1 text-xs font-bold bg-blue-50 text-blue-700 rounded-md border border-blue-100">HR Approved</span>;
      case "Rejected":
        return <span className="px-2.5 py-1 text-xs font-bold bg-red-50 text-red-700 rounded-md border border-red-100">Rejected</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold bg-amber-50 text-amber-700 rounded-md border border-amber-100">Pending</span>;
    }
  };

  const getLeaveTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      Casual: "bg-indigo-50 text-indigo-700 border-indigo-100",
      Sick: "bg-rose-50 text-rose-700 border-rose-100",
      Paid: "bg-teal-50 text-teal-700 border-teal-100",
      Unpaid: "bg-slate-100 text-slate-700 border-slate-200",
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${colors[type] || "bg-slate-50 text-slate-600"}`}>
        {type}
      </span>
    );
  };

  // മാനേജർമാർക്ക് അപ്പ്രൂവൽ ആക്ഷൻ കാണിക്കണോ എന്ന് തീരുമാനിക്കുന്നു
  const showActions = (leave: LeaveRequest) => {
    if (!canApprove) return false;
    if (leave.status === "Rejected" || leave.status === "Approved") return false;
    if (isHR && leave.status === "HR Approved") return false;
    return true;
  };

  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {(isHR || isAdmin) && <TableHead className="w-[100px]">Staff ID</TableHead>}
              <TableHead className="w-[120px]">Type</TableHead>
              <TableHead className="w-[200px]">From - To</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="w-[130px]">Status</TableHead>
              <TableHead className="w-[180px]">HR Approval</TableHead>
              <TableHead className="w-[180px]">Admin Approval</TableHead>
              {canApprove && <TableHead className="w-[150px] text-center">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={canApprove ? 8 : 6} className="text-center py-8 text-slate-400">
                  Loading leaves data...
                </TableCell>
              </TableRow>
            ) : leaves.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canApprove ? 8 : 6} className="text-center py-10 text-slate-400">
                  No leave requests found.
                </TableCell>
              </TableRow>
            ) : (
              leaves.map((leave) => (
                <TableRow key={leave.id}>
                  {(isHR || isAdmin) && (
                    <TableCell className="font-semibold text-slate-700">#{leave.staff_id}</TableCell>
                  )}
                  <TableCell>{getLeaveTypeBadge(leave.leave_type)}</TableCell>
                  <TableCell className="font-medium text-slate-700">
                    <div className="text-xs text-slate-600">
                      {leave.from_date} <span className="text-slate-400 font-normal">to</span> {leave.to_date}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-slate-600 line-clamp-1 max-w-xs" title={leave.reason}>
                      {leave.reason}
                    </p>
                  </TableCell>
                  <TableCell>{getStatusBadge(leave.status)}</TableCell>
                  <TableCell>
                    {leave.hr_approved_by ? (
                      <div className="flex flex-col text-xs text-emerald-600 font-semibold">
                        <span>Approved (ID: {leave.hr_approved_by})</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {new Date(leave.hr_approved_at!).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {leave.admin_approved_by ? (
                      <div className="flex flex-col text-xs text-emerald-600 font-semibold">
                        <span>Approved (ID: {leave.admin_approved_by})</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {new Date(leave.admin_approved_at!).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </TableCell>
                  {canApprove && (
                    <TableCell>
                      {showActions(leave) ? (
                        <div className="flex justify-center gap-1.5">
                          <button
                            onClick={() => onApprove?.(leave.id)}
                            className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors cursor-pointer"
                            title="Approve"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => onReject?.(leave.id)}
                            className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                            title="Reject"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 text-center font-medium">Completed</div>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
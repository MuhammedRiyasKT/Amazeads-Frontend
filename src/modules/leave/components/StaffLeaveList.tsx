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
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Rejected":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const getLeaveTypeStyle = (type: string) => {
    const styles: Record<string, string> = {
      Casual: "bg-indigo-50 text-indigo-700 border-indigo-200",
      Sick: "bg-pink-50 text-pink-700 border-pink-200",
      Paid: "bg-teal-50 text-teal-700 border-teal-200",
      Unpaid: "bg-slate-100 text-slate-700 border-slate-200",
    };
    return styles[type] || "bg-slate-50 text-slate-600 border-slate-200";
  };

  const renderHRStatus = (leave: LeaveRequest) => {
    if (leave.status === "Pending") {
      return (
        <span className="text-xs text-amber-600 font-semibold bg-amber-50/50 px-2.5 py-0.5 rounded border border-amber-100/50 animate-pulse">
          Pending Review
        </span>
      );
    }
    if (leave.status === "Rejected" && !leave.hr_approved_by) {
      return (
        <span className="text-xs text-rose-600 font-bold bg-rose-50/50 px-2.5 py-0.5 rounded border border-rose-200">
          HR Rejected
        </span>
      );
    }
    if (leave.hr_approved_by) {
      return (
        <div className="flex flex-col">
          <span className="text-xs text-sky-600 font-bold">HR Approved</span>
          {leave.hr_approved_at && (
            <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
              {new Date(leave.hr_approved_at).toLocaleDateString()}
            </span>
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
              <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
                {new Date(leave.admin_approved_at).toLocaleDateString()}
              </span>
            )}
          </div>
        );
      }
      if (leave.status === "Rejected") {
        return (
          <span className="text-xs text-rose-600 font-bold bg-rose-50/50 px-2.5 py-0.5 rounded border border-rose-200">
            Admin Rejected
          </span>
        );
      }
    }
    if (leave.manager_approved_by) {
      return (
        <div className="flex flex-col">
          <span className="text-xs text-indigo-600 font-bold">Manager Approved</span>
          {leave.manager_approved_at && (
            <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
              {new Date(leave.manager_approved_at).toLocaleDateString()}
            </span>
          )}
        </div>
      );
    }
    if (leave.status === "HR Approved") {
      return (
        <span className="text-xs text-amber-600 font-semibold bg-amber-50/50 px-2.5 py-0.5 rounded border border-amber-100/50 animate-pulse">
          Pending Review
        </span>
      );
    }
    if (leave.status === "Rejected" && leave.hr_approved_by && !leave.admin_approved_by && !leave.manager_approved_by) {
      return (
        <span className="text-xs text-rose-600 font-bold bg-rose-50/50 px-2.5 py-0.5 rounded border border-rose-200">
          Manager Rejected
        </span>
      );
    }
    return <span className="text-slate-400 text-xs font-medium">—</span>;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs w-full">
      {/* Card Header */}
      <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white">
        <h3 className="font-extrabold text-slate-900 text-sm">My Leave History</h3>
        <span className="text-[11px] bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full border border-slate-200/60">
          Total: {leaves.length} Applications
        </span>
      </div>

      {/* 💻 DESKTOP TABLE VIEW (>= md / 768px) */}
      <div className="hidden md:block overflow-x-auto w-full">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 border-b border-slate-200">
              <TableHead style={{ width: "130px" }}>Leave Type</TableHead>
              <TableHead style={{ width: "140px" }}>Final Status</TableHead>
              <TableHead style={{ width: "180px" }}>HR Status</TableHead>
              <TableHead style={{ width: "240px" }}>Manager & Admin Status</TableHead>
              <TableHead style={{ width: "130px", textAlign: "center" }}>Reason</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs font-semibold text-slate-500">
                  Loading applications...
                </TableCell>
              </TableRow>
            ) : leaves.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs font-semibold text-slate-400">
                  No leave requests found.
                </TableCell>
              </TableRow>
            ) : (
              leaves.map((leave) => {
                let finalDisplayStatus = leave.status;
                if (
                  leave.status === "Manager Approved" ||
                  leave.status === "HR Approved" ||
                  leave.status === "Pending"
                ) {
                  finalDisplayStatus = "Pending";
                }

                return (
                  <TableRow key={leave.id} className="hover:bg-slate-50/80 transition-colors">
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
                    
                    {/* Reason Column */}
                    <TableCell className="text-center">
                      <button
                        onClick={() => {
                          setSelectedLeave(leave);
                          setIsModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 text-[11px] text-indigo-600 hover:text-indigo-800 font-extrabold bg-indigo-50/60 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 transition-all cursor-pointer"
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

      {/* 📱 MOBILE CARDS VIEW (< md / 768px) 🌟 */}
      <div className="block md:hidden p-3 space-y-3 w-full">
        {isLoading ? (
          <div className="text-center py-8 text-xs font-semibold text-slate-500 bg-slate-50/50 rounded-xl border border-slate-200 p-4">
            Loading applications...
          </div>
        ) : leaves.length === 0 ? (
          <div className="text-center py-8 text-xs font-semibold text-slate-400 bg-slate-50/50 rounded-xl border border-slate-200 p-4">
            No leave requests found.
          </div>
        ) : (
          leaves.map((leave) => {
            let finalDisplayStatus = leave.status;
            if (
              leave.status === "Manager Approved" ||
              leave.status === "HR Approved" ||
              leave.status === "Pending"
            ) {
              finalDisplayStatus = "Pending";
            }

            return (
              <div
                key={leave.id}
                className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-3 w-full min-w-0"
              >
                {/* Top Row: Leave Type Badge & Final Status Badge */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span
                    className={`px-2.5 py-0.5 text-[11px] font-bold rounded-md border ${getLeaveTypeStyle(
                      leave.leave_type
                    )}`}
                  >
                    {leave.leave_type} Leave
                  </span>
                  <span
                    className={`px-2.5 py-0.5 text-[11px] font-bold rounded-md border ${getStatusStyle(
                      leave.status
                    )}`}
                  >
                    {finalDisplayStatus}
                  </span>
                </div>

                {/* Status Breakdown Grid */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">
                      HR Status
                    </span>
                    <div className="mt-0.5">{renderHRStatus(leave)}</div>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">
                      Manager & Admin
                    </span>
                    <div className="mt-0.5">{renderManagerAndAdminStatus(leave)}</div>
                  </div>
                </div>

                {/* Action Row */}
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      setSelectedLeave(leave);
                      setIsModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-[11px] text-indigo-600 hover:text-indigo-800 font-extrabold bg-indigo-50/60 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 transition-all cursor-pointer"
                  >
                    <Eye size={12} /> View Reason
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <LeaveDetailsModal
        isOpen={isModalOpen}
        leave={selectedLeave}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
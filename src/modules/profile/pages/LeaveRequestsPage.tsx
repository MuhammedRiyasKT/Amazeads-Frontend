"use client";

import React, { useState } from "react";
import { Plus, Calendar, Clock, CheckCircle2, Eye, X, FileText } from "lucide-react";
import Button from "@/components/ui/Button";
import styles from "../components/ProfileComponents.module.css";

interface LeaveRequest {
  id: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  numDays: number;
  finalStatus: "Pending" | "Approved" | "Rejected";
  hrStatus: string;
  managerStatus: string;
  reason: string;
}

export default function LeaveRequestsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  // Form State
  const [leaveType, setLeaveType] = useState("Sick");
  const [numDays, setNumDays] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const [leaveHistory, setLeaveHistory] = useState<LeaveRequest[]>([
    {
      id: 1,
      leaveType: "Sick",
      startDate: "2026-08-10",
      endDate: "2026-08-10",
      numDays: 1,
      finalStatus: "Pending",
      hrStatus: "Pending Review",
      managerStatus: "Waiting for HR",
      reason: "Feeling unwell, advised rest by doctor.",
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRequest: LeaveRequest = {
      id: Date.now(),
      leaveType,
      startDate,
      endDate,
      numDays,
      finalStatus: "Pending",
      hrStatus: "Pending Review",
      managerStatus: "Waiting for HR",
      reason,
    };

    setLeaveHistory([newRequest, ...leaveHistory]);
    alert("Leave request submitted successfully!");
    handleReset();
    setIsFormOpen(false);
  };

  const handleReset = () => {
    setLeaveType("Sick");
    setNumDays(1);
    setStartDate("");
    setEndDate("");
    setReason("");
  };

  const totalLeaves = leaveHistory.length;
  const pendingLeaves = leaveHistory.filter((l) => l.finalStatus === "Pending").length;
  const approvedLeaves = leaveHistory.filter((l) => l.finalStatus === "Approved").length;

  return (
    /* 🎯 എല്ലാ പേജുകളും പോലെ standard styles.container */
    <div className={styles.container}>
      {/* 1. Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
        <div>
          <h1 className={styles.welcomeText}>Leave Management</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Apply and monitor your leave requests for Designer department.
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0f172a] hover:bg-slate-800 text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus size={15} /> New Leave Application
        </button>
      </div>

      {/* 2. KPI Cards Grid */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Calendar size={20} />
            </div>
            <div className={styles.kpiInfo}>
              <span className={styles.kpiLabel}>TOTAL LEAVES</span>
              <strong className={styles.kpiValue}>{totalLeaves}</strong>
            </div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div className={styles.kpiInfo}>
              <span className={styles.kpiLabel}>PENDING APPLICATIONS</span>
              <strong className={styles.kpiValue}>{pendingLeaves}</strong>
            </div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div className={styles.kpiInfo}>
              <span className={styles.kpiLabel}>APPROVED APPLICATIONS</span>
              <strong className={styles.kpiValue}>{approvedLeaves}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Leave History Table Card */}
      <div className={styles.scheduleCard}>
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white">
          <h3 className="font-extrabold text-sm text-slate-900">
            My Leave History
          </h3>
          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            Total: {leaveHistory.length} Applications
          </span>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "140px" }}>LEAVE TYPE</th>
                <th style={{ width: "140px" }}>FINAL STATUS</th>
                <th style={{ width: "180px" }}>HR STATUS</th>
                <th>MANAGER & ADMIN STATUS</th>
                <th style={{ width: "130px", textAlign: "center" }}>REASON</th>
              </tr>
            </thead>
            <tbody>
              {leaveHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-xs text-slate-400">
                    No leave requests found.
                  </td>
                </tr>
              ) : (
                leaveHistory.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="px-2.5 py-1 bg-rose-50 text-rose-600 font-extrabold text-[11px] rounded-md inline-block border border-rose-100">
                        {item.leaveType}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`px-2.5 py-1 font-extrabold text-[11px] rounded-md inline-block border ${
                          item.finalStatus === "Approved"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : item.finalStatus === "Rejected"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {item.finalStatus}
                      </span>
                    </td>
                    <td>
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-800 font-extrabold text-[11px] rounded-md inline-block border border-amber-200">
                        {item.hrStatus}
                      </span>
                    </td>
                    <td className="text-xs text-slate-400 font-medium">
                      {item.managerStatus}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => setSelectedReason(item.reason)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-extrabold transition-colors cursor-pointer border border-indigo-100"
                      >
                        <Eye size={13} /> View Reason
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. NEW LEAVE APPLICATION MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">New Leave Application</h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/60"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Leave Type
                  </label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="Sick">Sick Leave</option>
                    <option value="Casual">Casual Leave</option>
                    <option value="Emergency">Emergency Leave</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Number of Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600"
                    value={numDays}
                    onChange={(e) => setNumDays(parseInt(e.target.value) || 1)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 cursor-pointer"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 cursor-pointer"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  Reason for Leave
                </label>
                <textarea
                  placeholder="Briefly describe the reason for your request..."
                  className="flex w-full rounded-lg border border-slate-200 bg-white p-3 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-600 min-h-[110px]"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. VIEW REASON MODAL */}
      {selectedReason && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-5 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900">Leave Reason</h3>
              <button
                onClick={() => setSelectedReason(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed font-medium">
              {selectedReason}
            </p>
            <div className="flex justify-end pt-1">
              <Button size="sm" variant="outline" onClick={() => setSelectedReason(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
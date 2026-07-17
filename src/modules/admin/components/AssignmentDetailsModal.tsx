"use client";

import React, { useEffect, useState } from "react";
import { X, Calendar, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { getAssignmentDetails, AssignmentDetails } from "../services/task.service";
import styles from "./TaskComponents.module.css";

interface AssignmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: number;
}

export default function AssignmentDetailsModal({ isOpen, onClose, assignmentId }: AssignmentDetailsModalProps) {
  const [details, setDetails] = useState<AssignmentDetails | null>(null);

  useEffect(() => {
    if (isOpen && assignmentId) {
      getAssignmentDetails(assignmentId)
        .then((data) => setDetails(data))
        .catch((err) => console.error("Error loading assignment details:", err));
    }
  }, [isOpen, assignmentId]);

  if (!isOpen) return null;

  const getDayName = (dayNum: number) => {
    const days = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days[dayNum] || "";
  };

  const getStatusBadge = (status: string) => {
    const s = status ? status.toLowerCase() : "";
    if (s === "completed") return <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-600 rounded uppercase">Completed</span>;
    return <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-500 rounded uppercase">Pending</span>;
  };

  return (
    // 1. ഇൻലൈൻ സ്റ്റൈൽ വഴി ഈ വിൻഡോ എപ്പോഴും ഡാർക്ക് പശ്ചാത്തലത്തോടെ നടുവിലായി ലോക്ക് ചെയ്യുന്നു (പ്രധാന മാറ്റം!)
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
        zIndex: 10005, // ടേബിളിന് മുകളിൽ കാണിക്കാൻ ഉയർന്ന z-index
        padding: "16px"
      }}
    >
      {/* 2. മെയിൻ മോഡൽ ബോക്സ് സ്റ്റൈൽ */}
      <div 
        style={{
          width: "100%",
          maxWidth: "600px",
          maxHeight: "85vh",        // സ്ക്രീൻ ഹൈറ്റിന്റെ പരമാവധി 85% ആയി ലോക്ക് ചെയ്യുന്നു
          overflowY: "auto",        // കണ്ടെന്റ് കൂടിയാൽ തനിയെ സ്ക്രോൾ വരാൻ
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          padding: "28px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
          boxSizing: "border-box"
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-900">Daywise Tracking Logs</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {details && (
          <div className="flex flex-col gap-5 text-left py-2">
            {/* Header info */}
            <div>
              <strong className="text-xs text-slate-400 block uppercase tracking-wide">TASK</strong>
              <h3 className="text-base font-bold text-slate-900 mt-1">{details.task_name}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{details.task_description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-lg p-3">
              <div>
                <span>STAFF:</span> <strong className="text-slate-800">{details.staff_name} ({details.role_name})</strong>
              </div>
              <div>
                <span>RANGE:</span> <strong className="text-slate-800">{details.start_date} - {details.end_date}</strong>
              </div>
              <div className="col-span-2">
                <span>SCHEDULED DAYS:</span>{" "}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {details.scheduled_days && details.scheduled_days.length > 0 ? (
                    details.scheduled_days.map((dayNum) => (
                      <span key={dayNum} className="px-1.5 py-0.5 text-[10px] font-bold bg-white border border-slate-200 rounded text-slate-700">
                        {getDayName(dayNum)}
                      </span>
                    ))
                  ) : (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-white border border-slate-200 rounded text-slate-500">Everyday</span>
                  )}
                </div>
              </div>
              <div className="col-span-2 border-t border-slate-200/60 my-1" />
              <div>
                <span>TOTAL DAYS: <strong className="text-slate-800">{details.total_days}</strong></span>
              </div>
              <div className="flex gap-2">
                <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded">Done: {details.completed_days}</span>
                <span className="text-[10px] bg-amber-50 text-amber-600 font-bold px-1.5 py-0.5 rounded">Pend: {details.pending_days}</span>
                <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-1.5 py-0.5 rounded">Over: {details.overdue_days}</span>
              </div>
            </div>

            {/* Daywise logs table */}
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wide mb-3">DAYWISE TRACKING LOGS</span>
              <div className={styles.tableContainer} style={{ border: "1px solid #e2e8f0" }}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead style={{ width: "100px" }}>DATE</TableHead>
                      <TableHead style={{ width: "90px" }}>STATUS</TableHead>
                      <TableHead style={{ width: "70px", textAlign: "center" }}>%</TableHead>
                      <TableHead style={{ width: "80px", textAlign: "center" }}>HOURS</TableHead>
                      <TableHead>WORK DESCRIPTION</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {details.daywise_tracking.map((log, index) => (
                      <TableRow 
                        key={index}
                        className={log.is_overdue && log.task_status !== "completed" ? "bg-rose-50/40" : ""}
                      >
                        <td className="px-3 py-2 text-xs font-bold text-slate-800">{log.work_date}</td>
                        <td className="px-3 py-2">{getStatusBadge(log.task_status)}</td>
                        <td className="px-3 py-2 text-xs text-center font-bold text-slate-800">
                          {log.progress_percentage !== null ? `${log.progress_percentage}%` : "0%"}
                        </td>
                        <td className="px-3 py-2 text-xs text-center font-bold text-slate-800">
                          {log.worked_hours !== null ? `${log.worked_hours}h` : "-"}
                        </td>
                        <td className="px-3 py-2 text-xs leading-normal">
                          <div className="flex items-center justify-between gap-2">
                            <span>{log.work_description || "-"}</span>
                            {log.is_overdue && log.task_status !== "completed" && (
                              <span className="text-[9px] bg-red-100 text-red-600 font-bold px-1 py-0.5 rounded flex items-center gap-1 shrink-0">
                                <AlertCircle size={10} /> OVERDUE
                              </span>
                            )}
                          </div>
                        </td>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        <div className={styles.modalActions} style={{ marginTop: "16px" }}>
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
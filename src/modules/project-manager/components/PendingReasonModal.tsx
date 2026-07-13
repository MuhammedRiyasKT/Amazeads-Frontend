"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import { AssignedTask } from "../services/task.service";
import styles from "./DailyTasksComponents.module.css";

interface PendingReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: AssignedTask | null;
  onSave: (assignmentId: number, reason: string, date: string) => void;
}

export default function PendingReasonModal({ isOpen, onClose, task, onSave }: PendingReasonModalProps) {
  const [reason, setReason] = useState("");
  const [workDate, setWorkDate] = useState(new Date().toISOString().substring(0, 10));

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(task.assignment_id, reason, workDate);
    setReason(""); // ഫോം റീസെറ്റ് ചെയ്യുന്നു
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
          maxWidth: "460px",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          padding: "28px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
          boxSizing: "border-box"
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-900">Log Pending Reason</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-400 uppercase">Selected Task</span>
            <strong className="text-sm text-slate-800">{task.task_name}</strong>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 tracking-wide uppercase">DATE</label>
            <input 
              type="date" 
              value={workDate} 
              onChange={(e) => setWorkDate(e.target.value)} 
              required 
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none" 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 tracking-wide uppercase">REASON FOR DELAY</label>
            <textarea 
              value={reason} 
              onChange={(e) => setReason(e.target.value)} 
              placeholder="e.g. Machine under maintenance, Waiting for client raw materials..." 
              required 
              rows={4}
              className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" 
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit">Submit Reason</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import { AssignedTask } from "../services/task.service";

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
    setReason("");
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[2500] p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 p-5 sm:p-6">
        <div className="flex justify-between items-center mb-5 border-b pb-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase">Log Pending Reason</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-semibold text-slate-600">
          <div className="flex flex-col gap-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Selected Task</span>
            <strong className="text-xs text-slate-800 font-bold">{task.task_name}</strong>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 tracking-wide uppercase">Work Date</label>
            <input 
              type="date" 
              value={workDate} 
              onChange={(e) => setWorkDate(e.target.value)} 
              required 
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none" 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 tracking-wide uppercase">Reason for Delay</label>
            <textarea 
              value={reason} 
              onChange={(e) => setReason(e.target.value)} 
              placeholder="e.g. Machine under maintenance, Waiting for client materials..." 
              required 
              rows={4}
              className="flex w-full rounded-lg border border-slate-200 bg-white p-3 text-xs focus:outline-none focus:border-indigo-500" 
            />
          </div>

          <div className="flex justify-end gap-2.5 mt-2 border-t pt-3">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit" className="bg-indigo-600 font-bold">Submit Reason</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
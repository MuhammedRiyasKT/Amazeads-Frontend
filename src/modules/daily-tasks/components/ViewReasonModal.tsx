"use client";

import React from "react";
import { X, Calendar } from "lucide-react";
import Button from "@/components/ui/Button";
import { AssignedTask } from "../services/task.service";

interface ViewReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: AssignedTask | null;
}

export default function ViewReasonModal({ isOpen, onClose, task }: ViewReasonModalProps) {
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[2500] p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 p-5 sm:p-6">
        <div className="flex justify-between items-center mb-5 border-b pb-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase">Logged Reason</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4 text-xs font-semibold text-slate-600">
          <div className="flex flex-col gap-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Selected Task</span>
            <strong className="text-xs text-slate-800 font-bold">{task.task_name}</strong>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 font-bold">
            <Calendar size={13} className="text-indigo-600" /> Logged Date: {task.work_date || "N/A"}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Logged Reason Notes</span>
            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3.5 text-xs font-medium text-slate-700 leading-relaxed break-words whitespace-pre-wrap">
              {task.work_description || "No reason logged."}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-5 border-t pt-3">
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
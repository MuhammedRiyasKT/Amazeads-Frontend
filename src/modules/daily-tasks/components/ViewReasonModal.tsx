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
          maxWidth: "440px",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          padding: "28px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
          boxSizing: "border-box"
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-900">Logged Reason</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-400 uppercase">Selected Task</span>
            <strong className="text-sm text-slate-800">{task.task_name}</strong>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
            <Calendar size={14} /> Logged Date: {task.work_date || "N/A"}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase">Reason</span>
            {/* പാരഗ്രാഫ് കാരണം ബ്രേക്ക് ആവാതിരിക്കാൻ വേഡ്-റേപ്പ് അടക്കം ഉൾപ്പെടുത്തിയ ബോക്സ് */}
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 text-sm text-slate-700 leading-relaxed break-words whitespace-pre-wrap">
              {task.work_description || "No reason logged."}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
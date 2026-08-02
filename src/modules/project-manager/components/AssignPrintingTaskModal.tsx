"use client";

import React, { useEffect, useState } from "react";
import { X, Printer, UserCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import { getPMProjectStaffs, getPMSubDepartments, assignPrintingTask } from "../services/managerOrder.service";

interface AssignPrintingTaskModalProps {
  isOpen: boolean;
  orderId: number | null;
  projectId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignPrintingTaskModal({ 
  isOpen, 
  orderId, 
  projectId, 
  onClose, 
  onSuccess 
}: AssignPrintingTaskModalProps) {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [subDepartments, setSubDepartments] = useState<any[]>([]);

  // Form States
  const [assignedTo, setAssignedTo] = useState<number>(0);
  const [subDepartmentId, setSubDepartmentId] = useState<number>(0);
  const [description, setDescription] = useState("Nil");
  const [completionTime, setCompletionTime] = useState("2026-08-02T15:24:23.654Z");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getPMProjectStaffs().then(setStaffList).catch(console.error);
      getPMSubDepartments(2).then(setSubDepartments).catch(console.error); // 2 = Printing Department ID
      
      setAssignedTo(0);
      setSubDepartmentId(0);
      setDescription("Nil");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !projectId || !assignedTo || !subDepartmentId) {
      alert("Please select staff and printing sub-department!");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      order_id: orderId,
      project_id: projectId,
      department_id: 2, // Printing Dept ID
      sub_department_id: subDepartmentId,
      assigned_to: assignedTo,
      task_description: description,
      completion_time: new Date(completionTime).toISOString(),
      status: "Pending"
    };

    try {
      await assignPrintingTask(payload);
      alert("Printing Task assigned successfully!");
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to assign printing task");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Printing Operator റോളുള്ള സ്റ്റാഫുകളെ ഫിൽട്ടർ ചെയ്യുന്നു
  const printingStaffs = staffList.filter((s) => {
    const role = s.role_name.toLowerCase();
    return role === "operator" || role === "printing" || role === "printer";
  });

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[2500] p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between px-5 py-4 border-b bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Printer className="text-indigo-600" size={18} />
            <h3 className="font-bold text-slate-800 text-sm uppercase">Assign Printing Task</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 text-xs font-semibold text-slate-600">
          
          {/* 1. Sub-Department Selection (UV Print, Laser Print, Photo Print) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Select Printing Unit / Machine *</label>
            <select
              value={subDepartmentId}
              onChange={(e) => setSubDepartmentId(parseInt(e.target.value))}
              className="h-10 border border-slate-200 rounded-lg px-3 bg-white text-xs font-bold focus:outline-none cursor-pointer"
              required
            >
              <option value={0}>Choose Sub-Department Unit</option>
              {subDepartments.map((sd) => (
                <option key={sd.id} value={sd.id}>
                  {sd.sub_department_name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Select Staff Member */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <UserCheck size={12} className="text-indigo-600" />
              <span>Select Print Operator *</span>
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(parseInt(e.target.value))}
              className="h-10 border border-slate-200 rounded-lg px-3 bg-white text-xs font-bold focus:outline-none cursor-pointer"
              required
            >
              <option value={0}>Choose Print Operator</option>
              {(printingStaffs.length > 0 ? printingStaffs : staffList).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.staff_name} ({s.role_name})
                </option>
              ))}
            </select>
          </div>

          {/* Target Completion Time */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Completion Deadline *</label>
            <input
              type="datetime-local"
              value={completionTime.substring(0, 16)}
              onChange={(e) => setCompletionTime(e.target.value)}
              className="h-10 border rounded-lg px-3 text-xs focus:outline-none bg-white"
              required
            />
          </div>

          {/* Task Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Print Instructions / Remarks</label>
            <textarea
              placeholder="Provide machine media or color profile notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border rounded-lg p-3 text-xs focus:outline-none min-h-[70px]"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t mt-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting || !assignedTo || !subDepartmentId}>
              {isSubmitting ? "Assigning..." : "Assign Printing Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
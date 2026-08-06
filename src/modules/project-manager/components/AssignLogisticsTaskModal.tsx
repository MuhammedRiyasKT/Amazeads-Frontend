"use client";

import React, { useEffect, useState } from "react";
import { X, Truck, UserCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import { getPMProjectStaffs, assignLogisticsTask } from "../services/managerOrder.service";

interface AssignLogisticsTaskModalProps {
  isOpen: boolean;
  orderId: number | null;
  projectId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignLogisticsTaskModal({ 
  isOpen, 
  orderId, 
  projectId, 
  onClose, 
  onSuccess 
}: AssignLogisticsTaskModalProps) {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [assignedTo, setAssignedTo] = useState<number>(0);
  const [description, setDescription] = useState("Nil");
  const [completionTime, setCompletionTime] = useState("2026-08-05T08:49:01.310Z");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getPMProjectStaffs().then(setStaffList).catch(console.error);
      setAssignedTo(0);
      setDescription("Nil");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !projectId || !assignedTo) {
      alert("Please select logistics staff!");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      assigned_to: assignedTo,
      order_id: orderId,
      project_id: projectId,
      department_id: 4, // Logistics Dept ID
      sub_department_id: 0, // Logistics-ന് sub_department ഇല്ലാത്തതിനാൽ 0
      task_description: description,
      completion_time: new Date(completionTime).toISOString(),
      status: "Pending"
    };

    try {
      await assignLogisticsTask(payload);
      alert("Logistics task assigned successfully!");
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to assign logistics task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const logisticsStaffs = staffList.filter((s) => {
    const role = s.role_name.toLowerCase();
    return role === "logistics" || role === "courier" || role === "delivery";
  });

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[2500] p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between px-5 py-4 border-b bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Truck className="text-indigo-600" size={18} />
            <h3 className="font-bold text-slate-800 text-sm uppercase">Assign Logistics Task</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 text-xs font-semibold text-slate-600">
          {/* Staff Member */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <UserCheck size={12} className="text-indigo-600" />
              <span>Select Logistics Staff *</span>
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(parseInt(e.target.value))}
              className="h-10 border border-slate-200 rounded-lg px-3 bg-white text-xs font-bold focus:outline-none cursor-pointer"
              required
            >
              <option value={0}>Choose Logistics Person</option>
              {(logisticsStaffs.length > 0 ? logisticsStaffs : staffList).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.staff_name} ({s.role_name})
                </option>
              ))}
            </select>
          </div>

          {/* Completion Time */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Target Completion Time *</label>
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
            <label className="text-[10px] font-bold text-slate-400 uppercase">Logistics Instructions / Delivery Remarks</label>
            <textarea
              placeholder="Provide courier or packing notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border rounded-lg p-3 text-xs focus:outline-none min-h-[70px]"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t mt-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting || !assignedTo}>
              {isSubmitting ? "Assigning..." : "Assign Logistics Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
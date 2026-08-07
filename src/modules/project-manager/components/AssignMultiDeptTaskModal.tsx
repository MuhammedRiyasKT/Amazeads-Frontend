"use client";

import React, { useEffect, useState } from "react";
import { X, ClipboardList, UserCheck, Cog } from "lucide-react";
import Button from "@/components/ui/Button";
import { 
  getPMProjectStaffs, 
  getPMSubDepartments, 
  getPMProjectDepartments, 
  getOrderProjectsAssignments,
  assignGeneralProjectTask,
  assignPrintingTask,
  assignProductionTask
} from "../services/managerOrder.service";

interface AssignMultiDeptTaskModalProps {
  isOpen: boolean;
  orderId: number | null;
  projectId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignMultiDeptTaskModal({
  isOpen,
  orderId,
  projectId,
  onClose,
  onSuccess,
}: AssignMultiDeptTaskModalProps) {
  const [allowedDepartments, setAllowedDepartments] = useState<any[]>([]); // 🌟 അനുവാദമുള്ള ഡിപ്പാർട്ട്മെന്റുകൾ മാത്രം
  const [staffList, setStaffList] = useState<any[]>([]);
  const [subDepartments, setSubDepartments] = useState<any[]>([]);

  // Form States
  const [departmentId, setDepartmentId] = useState<number>(1);
  const [subDepartmentId, setSubDepartmentId] = useState<number>(0);
  const [assignedTo, setAssignedTo] = useState<number>(0);
  const [description, setDescription] = useState("Nil");
  const [completionTime, setCompletionTime] = useState("2026-08-05T13:08:47.535Z");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);

  useEffect(() => {
    if (isOpen && orderId && projectId) {
      setIsLoadingAssignments(true);
      getPMProjectStaffs().then(setStaffList).catch(console.error);

      // 🌟 Order ID ക്രിയേറ്റ് ചെയ്തപ്പോൾ `is_assigned: true` കൊടുത്ത ഡിപ്പാർട്ട്മെന്റുകൾ മാത്രം ഫെച്ച് ചെയ്യുന്നു
      getOrderProjectsAssignments(orderId)
        .then((data) => {
          const targetProj = (data || []).find(
            (p: any) => (p.project_id || p.id) === projectId
          );

          if (targetProj && targetProj.departments) {
            // is_assigned === true ഉള്ള ഡിപ്പാർട്ട്മെന്റുകൾ മാത്രം ഫിൽട്ടർ ചെയ്യുന്നു 🌟
            const enabledDepts = targetProj.departments.filter(
              (d: any) => d.is_assigned === true
            );
            setAllowedDepartments(enabledDepts);

            // അനുവാദമുള്ള ഒന്നാമത്തെ ഡിപ്പാർട്ട്മെന്റ് പ്രീ-സെലക്ട് ചെയ്യുന്നു
            if (enabledDepts.length > 0) {
              setDepartmentId(enabledDepts[0].id || enabledDepts[0].department_id);
            }
          }
        })
        .catch(console.error)
        .finally(() => setIsLoadingAssignments(false));

      setSubDepartmentId(0);
      setAssignedTo(0);
      setDescription("Nil");
    }
  }, [isOpen, orderId, projectId]);

  // 🌟 ഡിപ്പാർട്ട്മെന്റ് മാറുമ്പോൾ ആവശ്യമായ ഡ്രോപ്പ്ഡൗൺ ഡാറ്റ മാത്രം ലോഡ് ചെയ്യുന്നു
  useEffect(() => {
    setAssignedTo(0);
    setSubDepartmentId(0);

    if (departmentId === 2 || departmentId === 3) {
      getPMSubDepartments(departmentId).then(setSubDepartments).catch(console.error);
    } else {
      setSubDepartments([]);
    }
  }, [departmentId]);

  if (!isOpen) return null;

  // Designing (1) & Logistics (4) സ്റ്റാഫുകളെ ഫിൽട്ടർ ചെയ്യുന്നു
  const availableStaffs = staffList.filter((staff) => {
    const role = (staff.role_name || "").toLowerCase();
    if (departmentId === 1) return role.includes("design");
    if (departmentId === 4) return role.includes("logistic") || role.includes("courier") || role.includes("delivery");
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !projectId || !departmentId) {
      alert("Please select target department!");
      return;
    }

    setIsSubmitting(true);

    try {
      if (departmentId === 1 || departmentId === 4) {
        // 1. Designing (1) or Logistics (4) -> General Task Endpoint
        if (!assignedTo) {
          alert("Please select a staff member!");
          setIsSubmitting(false);
          return;
        }

        const payload = {
          assigned_to: assignedTo,
          order_id: orderId,
          project_id: projectId,
          department_id: departmentId,
          sub_department_id: 0,
          task_description: description,
          completion_time: new Date(completionTime).toISOString(),
          status: "Pending",
        };
        await assignGeneralProjectTask(payload);

      } else if (departmentId === 2) {
        // 2. Printing (2) -> Printing Task Endpoint
        if (!subDepartmentId) {
          alert("Please select a printing unit!");
          setIsSubmitting(false);
          return;
        }

        const payload = {
          order_id: orderId,
          project_id: projectId,
          department_id: 2,
          sub_department_id: subDepartmentId,
          task_description: description,
          completion_time: new Date(completionTime).toISOString(),
          status: "Pending",
        };
        await assignPrintingTask(payload);

      } else if (departmentId === 3) {
        // 3. Production (3) -> Production Task Endpoint
        if (!subDepartmentId) {
          alert("Please select a production unit!");
          setIsSubmitting(false);
          return;
        }

        const payload = {
          order_id: orderId,
          project_id: projectId,
          department_id: 3,
          sub_department_id: subDepartmentId,
          task_description: description,
          completion_time: new Date(completionTime).toISOString(),
          status: "Pending",
        };
        await assignProductionTask(payload);
      }

      alert("Task assigned successfully!");
      onSuccess();
    } catch (err: any) {
      console.error("Error assigning task:", err);
      const errMsg = err?.response?.data?.detail || "Failed to assign task";
      alert(`Error: ${errMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[2500] p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between px-5 py-4 border-b bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ClipboardList className="text-indigo-600" size={18} />
            <h3 className="font-bold text-slate-800 text-sm uppercase">Assign Department Task</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 text-xs font-semibold text-slate-600">
          
          {/* 🌟 1. Target Department Selection (അനുവാദമുള്ള ഡിപ്പാർട്ട്മെന്റുകൾ മാത്രം കാണിക്കുന്നു) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Target Department *</label>
            {isLoadingAssignments ? (
              <div className="text-xs text-slate-400 italic">Checking allowed department routing...</div>
            ) : allowedDepartments.length === 0 ? (
              <div className="p-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs">
                No active departments enabled for this project.
              </div>
            ) : (
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(parseInt(e.target.value))}
                className="h-10 border border-slate-200 rounded-lg px-3 bg-white text-xs font-bold focus:outline-none cursor-pointer"
                required
              >
                {allowedDepartments.map((d: any) => (
                  <option key={d.id || d.department_id} value={d.id || d.department_id}>
                    {d.id || d.department_id}. {(d.name || d.department_name).toUpperCase()}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 2. Sub-Department Selection (Printing 2 അല്ലെങ്കിൽ Production 3 എന്നിവയ്ക്ക് മാത്രം) */}
          {(departmentId === 2 || departmentId === 3) && (
            <div className="flex flex-col gap-1.5 animate-fade-in">
              <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Cog size={12} className="text-indigo-600" />
                <span>Select Machine / Unit *</span>
              </label>
              <select
                value={subDepartmentId}
                onChange={(e) => setSubDepartmentId(parseInt(e.target.value))}
                className="h-10 border border-indigo-200 rounded-lg px-3 bg-white text-xs font-bold focus:outline-none cursor-pointer"
                required
              >
                <option value={0}>Choose Machine / Sub-Unit</option>
                {subDepartments.map((sd) => (
                  <option key={sd.id} value={sd.id}>
                    {sd.sub_department_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 3. Staff Selection (Designing 1 അല്ലെങ്കിൽ Logistics 4 എന്നിവയ്ക്ക് മാത്രം) */}
          {(departmentId === 1 || departmentId === 4) && (
            <div className="flex flex-col gap-1.5 animate-fade-in">
              <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <UserCheck size={12} className="text-indigo-600" />
                <span>Select Staff Member *</span>
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(parseInt(e.target.value))}
                className="h-10 border border-indigo-200 rounded-lg px-3 bg-white text-xs font-bold focus:outline-none cursor-pointer"
                required
              >
                <option value={0}>Choose Staff Member</option>
                {availableStaffs.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.staff_name} ({s.role_name})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Target Deadline */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Target Deadline *</label>
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
            <label className="text-[10px] font-bold text-slate-400 uppercase">Instructions / Notes</label>
            <textarea
              placeholder="Provide specific notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border rounded-lg p-3 text-xs focus:outline-none min-h-[70px]"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t mt-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>Cancel</Button>
            <Button 
              variant="primary" 
              size="sm" 
              type="submit" 
              disabled={
                isSubmitting || 
                allowedDepartments.length === 0 ||
                ((departmentId === 1 || departmentId === 4) && !assignedTo) ||
                ((departmentId === 2 || departmentId === 3) && !subDepartmentId)
              }
            >
              {isSubmitting ? "Assigning..." : "Assign Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
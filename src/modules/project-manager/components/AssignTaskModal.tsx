"use client";

import React, { useEffect, useState } from "react";
import { X, ClipboardList, UserCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import { getPMProjectStaffs, getPMProjectDepartments, assignProjectTask, getPMProjectById } from "../services/managerOrder.service";

interface AssignTaskModalProps {
  isOpen: boolean;
  orderId: number | null;
  projectId: number | null;
  forceDepartmentType?: "designing" | "printing" | "all";
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignTaskModal({
  isOpen,
  orderId,
  projectId,
  forceDepartmentType = "all",
  onClose,
  onSuccess
}: AssignTaskModalProps) {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  // Form States
  const [assignedTo, setAssignedTo] = useState<number>(0);
  const [departmentId, setDepartmentId] = useState<number>(0);
  const [description, setDescription] = useState("Nil");
  const [projectDesignDate, setProjectDesignDate] = useState<string>("");
  const [projectPrintingDate, setProjectPrintingDate] = useState<string>("");
  const [completionDateStr, setCompletionDateStr] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().substring(0, 10);
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getPMProjectStaffs().then(setStaffList).catch(console.error);
      getPMProjectDepartments().then(setDepartments).catch(console.error);

      // Fetch project details to load default design date & printing date
      if (projectId) {
        getPMProjectById(projectId)
          .then((projData) => {
            if (projData) {
              const dDate = projData.design_date || "";
              const pDate = projData.printing_date || "";
              setProjectDesignDate(dDate);
              setProjectPrintingDate(pDate);

              const todayDate = new Date().toISOString().substring(0, 10);
              if (departmentId === 1 || (forceDepartmentType === "designing")) {
                setCompletionDateStr(dDate || todayDate);
              } else if (departmentId === 2 || (forceDepartmentType === "printing")) {
                setCompletionDateStr(pDate || todayDate);
              }
            }
          })
          .catch(console.error);
      }

      // Reset States
      setAssignedTo(0);
      setDescription("Nil");

      // പേജ് ലോക്കുകൾ അനുസരിച്ച് ഐഡി പ്രീ-സെലക്ട് ചെയ്യുന്നു
      if (forceDepartmentType === "designing") {
        setDepartmentId(1); // designing
      } else if (forceDepartmentType === "printing") {
        setDepartmentId(2); // printing
      } else {
        setDepartmentId(0);
      }
    }
  }, [isOpen, forceDepartmentType, projectId]);

  useEffect(() => {
    const todayDate = new Date().toISOString().substring(0, 10);
    if (departmentId === 1) {
      setCompletionDateStr(projectDesignDate || todayDate);
    } else if (departmentId === 2) {
      setCompletionDateStr(projectPrintingDate || todayDate);
    }
  }, [departmentId, projectDesignDate, projectPrintingDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !projectId || !assignedTo || !departmentId) {
      alert("Please select staff and department!");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      assigned_to: assignedTo,
      order_id: orderId,
      project_id: projectId,
      department_id: departmentId,
      task_description: description,
      completion_time: new Date(completionDateStr).toISOString(),
      status: "Assigned"
    };

    try {
      await assignProjectTask(payload);
      alert("Task assigned successfully!");
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to assign task");
    } finally {
      setIsSubmitting(false);
    }
  };

  // തിരഞ്ഞെടുക്കുന്ന ഡിപ്പാർട്ട്മെന്റിന് അനുയോജ്യമായ ജീവനക്കാരെ മാത്രം ഫിൽട്ടർ ചെയ്യുന്ന ഹെൽപ്പർ 🌟
  const getFilteredStaffList = () => {
    if (!departmentId) return [];

    const selectedDeptName = departments.find((d) => d.id === departmentId)?.department_name?.toLowerCase() || "";

    return staffList.filter((s) => {
      const role = s.role_name.toLowerCase();
      if (selectedDeptName === "designing") {
        return role === "designer" || role === "designing";
      }
      if (selectedDeptName === "printing") {
        return role === "operator" || role === "printing";
      }
      return role === selectedDeptName;
    });
  };

  const availableStaffs = getFilteredStaffList();

  // പേജ് അടിസ്ഥാനമാക്കിയുള്ള ഡിപ്പാർട്ട്മെന്റ് ലോക്കിങ്
  const filteredDepartments = departments.filter((d) => {
    const name = d.department_name.toLowerCase();
    const id = d.id;

    if (forceDepartmentType === "designing") {
      return id === 1 || name === "designing";
    }
    if (forceDepartmentType === "printing") {
      return id === 2 || name === "printing";
    }
    return true;
  });

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[2500] p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between px-5 py-4 border-b bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ClipboardList className="text-indigo-600" size={18} />
            <h3 className="font-bold text-slate-800 text-sm uppercase">Assign Project Task</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 text-xs font-semibold text-slate-600">

          {/* 1. Select Section (ഡിപ്പാർട്ട്മെന്റ് ആദ്യം തിരഞ്ഞെടുക്കുന്നു) 🌟 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Select Department Section *</label>
            <select
              value={departmentId}
              onChange={(e) => {
                setDepartmentId(parseInt(e.target.value));
                setAssignedTo(0); // ഡിപ്പാർട്ട്മെന്റ് മാറുമ്പോൾ സ്റ്റാഫ് സ്റ്റേറ്റ് റീസെറ്റ് ചെയ്യുന്നു
              }}
              disabled={forceDepartmentType !== "all"}
              className="h-10 border border-slate-200 rounded-lg px-3 bg-white text-xs font-bold focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer"
              required
            >
              {forceDepartmentType === "all" ? <option value={0}>Choose Section</option> : null}
              {filteredDepartments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.department_name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Select Staff Member (വകുപ്പ് തിരഞ്ഞെടുത്താൽ മാത്രം കാണിക്കുന്ന രണ്ടാമത്തെ ഡൈനാമിക് ഇൻപുട്ട്) 🌟 */}
          {departmentId > 0 && (
            <div className="flex flex-col gap-1.5 animate-fade-in">
              <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <UserCheck size={12} className="text-indigo-600" />
                <span>Select Staff Member *</span>
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(parseInt(e.target.value))}
                className="h-10 border rounded-lg px-3 bg-white text-xs font-bold focus:outline-none cursor-pointer border-indigo-200"
                required
              >
                <option value={0}>Choose Staff Member</option>
                {availableStaffs.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.staff_name} ({s.role_name})
                  </option>
                ))}
              </select>
              {availableStaffs.length === 0 && (
                <span className="text-[10px] text-red-500 italic mt-0.5">No active staff members found in this section.</span>
              )}
            </div>
          )}

          {/* Target completion date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              Target Completion Date * {(departmentId === 1 || departmentId === 2) && <span className="text-[9px] text-amber-600 font-extrabold normal-case">(Default locked)</span>}
            </label>
            <input
              type="date"
              value={completionDateStr}
              onChange={(e) => setCompletionDateStr(e.target.value)}
              disabled={departmentId === 1 || departmentId === 2}
              className="h-10 border rounded-lg px-3 text-xs focus:outline-none bg-white disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer disabled:cursor-not-allowed font-bold"
              required
            />
          </div>

          {/* Task Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Task Description</label>
            <textarea
              placeholder="Provide specific notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border rounded-lg p-3 text-xs focus:outline-none min-h-[80px]"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t mt-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting || !assignedTo}>
              {isSubmitting ? "Assigning..." : "Assign Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
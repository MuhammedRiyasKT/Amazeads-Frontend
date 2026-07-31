"use client";

import React, { useEffect, useState, useRef } from "react";
import { X, ClipboardList, Users, ChevronDown, ChevronUp } from "lucide-react";
import Button from "@/components/ui/Button";
import { getPMProjectStaffs, assignProjectTask } from "../services/managerOrder.service";

interface AssignTaskModalProps {
  isOpen: boolean;
  orderId: number | null;
  projectId: number | null;
  allowedDepartments: any[]; // ലഭ്യമായ വകുപ്പുകൾ മാത്രം കാണിക്കാൻ പ്രോപ്സ് ആഡ് ചെയ്തു 🌟
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignTaskModal({ isOpen, orderId, projectId, allowedDepartments, onClose, onSuccess }: AssignTaskModalProps) {
  const [staffList, setStaffList] = useState<any[]>([]);

  // Form States
  const [assignedTo, setAssignedTo] = useState<number>(0);
  const [selectedStaffName, setSelectedStaffName] = useState("");
  const [departmentId, setDepartmentId] = useState<number>(0);
  const [description, setDescription] = useState("Nil");
  const [completionTime, setCompletionTime] = useState("2026-07-31T12:46:27.397Z");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown UI States
  const [isStaffDropdownOpen, setIsStaffDropdownOpen] = useState(false);
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      getPMProjectStaffs().then(setStaffList).catch(console.error);
      
      // Reset States
      setAssignedTo(0);
      setSelectedStaffName("");
      setDepartmentId(0);
      setDescription("Nil");
      setExpandedRoles({});
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStaffDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const toggleRoleExpand = (roleName: string) => {
    setExpandedRoles((prev) => ({ ...prev, [roleName]: !prev[roleName] }));
  };

  const handleSelectStaff = (id: number, name: string) => {
    setAssignedTo(id);
    setSelectedStaffName(name);
    setIsStaffDropdownOpen(false);
  };

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
      completion_time: new Date(completionTime).toISOString(),
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

  const uniqueRoles = Array.from(new Set(staffList.map((s) => s.role_name)));

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
          
          {/* Custom Collapsible Dropdown */}
          <div className="flex flex-col gap-1.5 relative" ref={dropdownRef}>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Select Staff Member *</label>
            <button
              type="button"
              onClick={() => setIsStaffDropdownOpen(!isStaffDropdownOpen)}
              className="w-full h-10 border border-slate-200 rounded-lg px-4 flex items-center justify-between text-xs font-bold text-slate-700 bg-white cursor-pointer hover:bg-slate-50 transition-all shadow-sm"
            >
              <span className="flex items-center gap-2">
                <Users size={14} className="text-slate-500" />
                {selectedStaffName ? selectedStaffName : "Choose Staff / Department"}
              </span>
              {isStaffDropdownOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {isStaffDropdownOpen && (
              <div className="absolute top-11 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg max-h-56 overflow-y-auto z-[3000] p-2">
                <div
                  onClick={() => { setAssignedTo(0); setSelectedStaffName(""); setIsStaffDropdownOpen(false); }}
                  className="px-3 py-2 text-xs font-bold text-indigo-600 hover:bg-slate-50 rounded-lg cursor-pointer border-b mb-1 uppercase tracking-wider"
                >
                  ALL STAFF MEMBERS
                </div>
                {uniqueRoles.map((roleName) => {
                  const filteredStaffs = staffList.filter((s) => s.role_name === roleName);
                  const isExpanded = !!expandedRoles[roleName];
                  return (
                    <div key={roleName} className="flex flex-col">
                      <div
                        onClick={() => toggleRoleExpand(roleName)}
                        className="flex items-center justify-between px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase hover:bg-slate-50 rounded-md cursor-pointer"
                      >
                        <span>{roleName}</span>
                        {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                      </div>
                      {isExpanded && (
                        <div className="flex flex-col pl-3 border-l border-slate-100 ml-3">
                          {filteredStaffs.length === 0 ? (
                            <span className="px-3 py-1 text-[10px] text-slate-400 italic">No staff assigned</span>
                          ) : (
                            filteredStaffs.map((staff) => (
                              <div
                                key={staff.id}
                                onClick={() => handleSelectStaff(staff.id, staff.staff_name)}
                                className="px-3 py-1.5 text-xs text-slate-700 hover:bg-indigo-50/60 rounded-md cursor-pointer font-bold"
                              >
                                {staff.staff_name}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Select Section (ലഭ്യമായ ഡിപ്പാർട്ട്മെന്റുകൾ മാത്രം കാണിക്കുന്നു) 🌟 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Select Department Section *</label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(parseInt(e.target.value))}
              className="h-10 border rounded-lg px-3 bg-white text-xs font-bold focus:outline-none"
              required
            >
              <option value={0}>Choose Section</option>
              {allowedDepartments.map((d) => (
                <option key={d.department_id || d.id} value={d.department_id || d.id}>
                  {(d.department_name || d.name).toUpperCase()}
                </option>
              ))}
            </select>
            {allowedDepartments.length === 0 && (
              <span className="text-[10px] text-red-500 italic mt-0.5">No departments routed for this project during creation.</span>
            )}
          </div>

          {/* Completion date */}
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
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting || allowedDepartments.length === 0}>
              {isSubmitting ? "Assigning..." : "Assign Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
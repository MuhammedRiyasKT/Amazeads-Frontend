"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import { getDailyTasks, DailyTask, CreateAndAssignPayload } from "../services/task.service";
import { getStaffs, Staff } from "../services/staff.service";
import { getRoles, Role } from "../services/staff.service";

interface AssignOrCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: CreateAndAssignPayload) => void;
}

export default function AssignOrCreateModal({ isOpen, onClose, onSave }: AssignOrCreateModalProps) {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [departments, setDepartments] = useState<Role[]>([]);

  // Form states
  const [taskName, setTaskName] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<number | undefined>(undefined);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedStaffIds, setSelectedStaffIds] = useState<number[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startDate, setStartDate] = useState("2026-07-09");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState<number>(2);

  // Autocomplete suggestions
  const [showSuggestions, setShowSuggestions] = useState(false);

  const daysOfWeek = [
    { label: "M", val: 1 },
    { label: "T", val: 2 },
    { label: "W", val: 3 },
    { label: "T", val: 4 },
    { label: "F", val: 5 },
    { label: "S", val: 6 },
    { label: "S", val: 7 },
  ];

  useEffect(() => {
    if (isOpen) {
      getDailyTasks().then((data) => setTasks(data)).catch((err) => console.error(err));
      getStaffs().then((data) => setStaffs(data)).catch((err) => console.error(err));
      getRoles()
        .then((data) => {
          setDepartments(data.filter((r) => r.role_name.toLowerCase() !== "admin"));
        })
        .catch((err) => console.error(err));
      
      setTaskName("");
      setTaskDesc("");
      setSelectedTaskId(undefined);
      setSelectedDept("");
      setSelectedStaffIds([]);
      setSelectedDays([]);
      setEndDate("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // സജഷൻ ഫിൽട്ടറിംഗ് ലോജിക്
  const suggestions = tasks.filter((t) =>
    t.task_name.toLowerCase().includes(taskName.toLowerCase())
  );

  const handleSelectSuggestion = (task: DailyTask) => {
    setTaskName(task.task_name);
    setTaskDesc(task.task_description);
    setSelectedTaskId(task.id);
    setShowSuggestions(false);
  };

  const handleDayToggle = (dayVal: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayVal) ? prev.filter((d) => d !== dayVal) : [...prev, dayVal]
    );
  };

  const handleStaffToggle = (staffId: number) => {
    setSelectedStaffIds((prev) =>
      prev.includes(staffId) ? prev.filter((id) => id !== staffId) : [...prev, staffId]
    );
  };

  // ഡിപ്പാർട്ട്മെന്റ് ഫിൽട്ടർ ലോജിക്
  const filteredStaffs = staffs.filter(
    (s) => s.role_name.toLowerCase() === selectedDept.toLowerCase() && s.role_name.toLowerCase() !== "admin"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStaffIds.length === 0) {
      alert("Please select at least one staff!");
      return;
    }

    onSave({
      task_id: selectedTaskId,
      task_name: selectedTaskId ? "" : taskName,
      task_description: selectedTaskId ? "" : taskDesc,
      created_by: 2,
      staff_ids: selectedStaffIds,
      assigned_by: 2,
      start_date: startDate,
      end_date: endDate || startDate,
      priority,
      days: selectedDays.length > 0 ? selectedDays : [1, 2, 3, 4, 5, 6, 7],
    });
  };

  return (
    // 1. ഇൻലൈൻ സ്റ്റൈൽ ഉപയോഗിച്ച് മോഡൽ പശ്ചാത്തലം ഡാർക്ക് ആക്കി എപ്പോഴും നടുവിലായി ലോക്ക് ചെയ്യുന്നു
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
      {/* 2. മെയിൻ മോഡൽ ബോക്സ് സ്റ്റൈൽ (റീ-ഡിസൈൻ ചെയ്തത്) */}
      <div 
        style={{
          width: "100%",
          maxWidth: "500px",
          maxHeight: "90vh",       // സ്ക്രീൻ ഹൈറ്റിന്റെ പരമാവധി 90% ആയി ലോക്ക് ചെയ്യുന്നു (പ്രധാന മാറ്റം!)
          overflowY: "auto",        // കണ്ടെന്റ് കൂടിയാൽ മോഡലിനുള്ളിൽ തനിയെ സ്ക്രോൾ വരാൻ (പ്രധാന മാറ്റം!)
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          padding: "28px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
          boxSizing: "border-box"
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">Create & Assign Task</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Autocomplete Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 tracking-wide uppercase">TASK NAME</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Type task name (e.g. Office Cleaning)..."
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-indigo-500"
                value={taskName}
                onChange={(e) => {
                  setTaskName(e.target.value);
                  setSelectedTaskId(undefined);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                required
              />
              {showSuggestions && taskName && suggestions.length > 0 && (
                <div className="absolute top-11 left-0 right-0 bg-white border border-slate-200 rounded-md shadow-lg max-h-40 overflow-y-auto z-50">
                  {suggestions.map((t) => (
                    <div
                      key={t.id}
                      className="px-4 py-2 text-sm hover:bg-slate-100 cursor-pointer"
                      onClick={() => handleSelectSuggestion(t)}
                    >
                      {t.task_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 tracking-wide uppercase">TASK DESCRIPTION</label>
            <input
              type="text"
              placeholder="Task description"
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-indigo-500"
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              required
            />
          </div>

          {/* ഡിപ്പാർട്ട്മെന്റ് സെലക്ഷൻ */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 tracking-wide uppercase">SELECT DEPARTMENT</label>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setSelectedStaffIds([]);
              }}
              required
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-indigo-500 cursor-pointer"
            >
              <option value="">Choose Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.role_name}>{dept.role_name}</option>
              ))}
            </select>
          </div>

          {/* സ്റ്റാഫ് മൾട്ടി സെലക്ഷൻ ചെക്ക്ബോക്സുകൾ */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 tracking-wide uppercase">ASSIGN TO STAFF (SELECT MULTIPLE)</label>
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3 max-h-32 overflow-y-auto">
              {selectedDept === "" ? (
                <div className="text-xs text-slate-400 text-center py-2">Please choose a department first.</div>
              ) : filteredStaffs.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-2">No staff found in this department.</div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {filteredStaffs.map((staff) => (
                    <label key={staff.id} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <Checkbox
                        id={`staff-${staff.id}`}
                        checked={selectedStaffIds.includes(staff.id)}
                        onChange={() => handleStaffToggle(staff.id)}
                      />
                      <span>{staff.staff_name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* തീയതികൾ */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 tracking-wide uppercase">START DATE</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 tracking-wide uppercase">END DATE (OPTIONAL)</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none" />
            </div>
          </div>

          {/* റിപ്പീറ്റ് ദിവസങ്ങൾ */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 tracking-wide uppercase">REPEAT DAYS (WEEKLY SCHEDULE)</label>
            <div className="flex gap-1.5">
              {daysOfWeek.map((day) => (
                <div
                  key={day.val}
                  className={`w-8 h-8 rounded-full border border-slate-200 bg-white text-xs font-bold flex items-center justify-center cursor-pointer transition-all ${
                    selectedDays.includes(day.val) ? "bg-indigo-600 text-white border-indigo-600" : "text-slate-600 hover:bg-slate-50"
                  }`}
                  onClick={() => handleDayToggle(day.val)}
                >
                  {day.label}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 tracking-wide uppercase">PRIORITY</label>
            <select value={priority} onChange={(e) => setPriority(parseInt(e.target.value))} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none">
              <option value={1}>Low</option>
              <option value={2}>Medium</option>
              <option value={3}>High</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit">Create & Assign</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
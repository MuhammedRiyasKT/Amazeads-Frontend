"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import { getDailyTasks, DailyTask, AssignTaskPayload } from "../services/task.service";
import { getStaffs, Staff } from "../services/staff.service";
import styles from "./TaskComponents.module.css";

interface AssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (payload: AssignTaskPayload) => void;
}

export default function AssignTaskModal({ isOpen, onClose, onAssign }: AssignTaskModalProps) {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [staffs, setStaffs] = useState<Staff[]>([]);

  const [selectedTaskId, setSelectedTaskId] = useState<number>(0);
  const [selectedStaffId, setSelectedStaffId] = useState<number>(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState<number>(2);

  useEffect(() => {
    if (isOpen) {
      getDailyTasks()
        .then((data) => {
          setTasks(data);
          if (data.length > 0) setSelectedTaskId(data[0].id);
        })
        .catch((err) => console.error("Error loading tasks:", err));

      getStaffs()
        .then((data) => {
          setStaffs(data);
          if (data.length > 0) setSelectedStaffId(data[0].id);
        })
        .catch((err) => console.error("Error loading staffs:", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. സ്റ്റാഫ് ലിസ്റ്റിനെ ഡിപ്പാർട്ട്മെന്റ് (Role) തിരിച്ച് ഗ്രൂപ്പ് ചെയ്യാനുള്ള റിയാക്റ്റ് ലോജിക്
  const groupedStaffs = staffs.reduce((acc, staff) => {
    const department = staff.role_name || "Others";
    if (!acc[department]) {
      acc[department] = [];
    }
    acc[department].push(staff);
    return acc;
  }, {} as Record<string, Staff[]>);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAssign({
      task_id: selectedTaskId,
      staff_id: selectedStaffId,
      assigned_by: 6, 
      start_date: startDate,
      end_date: endDate,
      priority,
    });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Assign Task to Staff</h2>
          <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {/* ടാസ്ക് സെലക്ഷൻ */}
          <div className={styles.formGroup}>
            <label className={styles.label}>SELECT TASK</label>
            <select value={selectedTaskId} onChange={(e) => setSelectedTaskId(parseInt(e.target.value))} className={styles.modalSelect}>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>{t.task_name}</option>
              ))}
            </select>
          </div>

          {/* ഡിപ്പാർട്ട്മെന്റ് തിരിച്ചുള്ള സ്റ്റാഫ് സെലക്ഷൻ (optgroup ഉപയോഗിച്ചത്) */}
          <div className={styles.formGroup}>
            <label className={styles.label}>ASSIGN TO STAFF (GROUPED BY DEPARTMENT)</label>
            <select value={selectedStaffId} onChange={(e) => setSelectedStaffId(parseInt(e.target.value))} className={styles.modalSelect}>
              <option value="">Select Staff</option>
              {Object.keys(groupedStaffs).map((department) => (
                // ഡിപ്പാർട്ട്മെന്റിന്റെ പേര് ഹെഡ്ഡർ ആയി കാണിക്കുന്നു
                <optgroup key={department} label={department.toUpperCase()} style={{ fontWeight: "bold", color: "#4f46e5" }}>
                  {groupedStaffs[department].map((staff) => (
                    // ആ ഡിപ്പാർട്ട്മെന്റിലെ സ്റ്റാഫുകളെ മാത്രം കാണിക്കുന്നു
                    <option key={staff.id} value={staff.id} style={{ fontWeight: "normal", color: "#1e293b" }}>
                      {staff.staff_name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={styles.formGroup}>
              <label className={styles.label}>START DATE</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className={styles.modalInput} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>END DATE</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className={styles.modalInput} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>PRIORITY</label>
            <select value={priority} onChange={(e) => setPriority(parseInt(e.target.value))} className={styles.modalSelect}>
              <option value={1}>Low</option>
              <option value={2}>Medium</option>
              <option value={3}>High</option>
            </select>
          </div>

          <div className={styles.modalActions}>
            <Button variant="outline" size="sm" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit">Assign Task</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
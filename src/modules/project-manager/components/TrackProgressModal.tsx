"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import { TrackProgressPayload, AssignedTask } from "../services/task.service";
import styles from "./MyTasksComponents.module.css";

interface TrackProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: AssignedTask | null;
  onTrack: (payload: TrackProgressPayload) => void;
}

export default function TrackProgressModal({ isOpen, onClose, task, onTrack }: TrackProgressModalProps) {
  const [workDate, setWorkDate] = useState("2026-07-06");
  const [progress, setProgress] = useState<number>(0);
  const [hours, setWorkedHours] = useState<number>(1);
  const [taskStatus, setTaskStatus] = useState<"Not Started" | "In Progress" | "Completed">("In Progress");
  const [description, setDescription] = useState("");

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTrack({
      assignment_id: task.assignment_id,
      work_date: workDate,
      work_description: description,
      progress_percentage: progress,
      worked_hours: hours,
      task_status: taskStatus,
    });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Track Progress - {task.task_name}</h2>
          <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className="grid grid-cols-2 gap-4">
            <div className={styles.formGroup}>
              <label className={styles.label}>WORK DATE</label>
              <input type="date" value={workDate} onChange={(e) => setWorkDate(e.target.value)} required className={styles.modalInput} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>WORKED HOURS</label>
              <input type="number" step="0.5" value={hours} onChange={(e) => setWorkedHours(parseFloat(e.target.value) || 0)} required className={styles.modalInput} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={styles.formGroup}>
              <label className={styles.label}>PROGRESS (%)</label>
              <input type="number" min="0" max="100" value={progress} onChange={(e) => setProgress(parseInt(e.target.value) || 0)} required className={styles.modalInput} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>TASK STATUS</label>
              <select value={taskStatus} onChange={(e) => setTaskStatus(e.target.value as any)} className={styles.modalSelect}>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>WORK DESCRIPTION</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the work done..." required className={`${styles.modalInput} ${styles.modalTextarea}`} rows={3} />
          </div>

          <div className={styles.modalActions}>
            <Button variant="outline" size="sm" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit">Log Work</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
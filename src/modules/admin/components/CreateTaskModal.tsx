"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import { CreateTaskPayload } from "../services/task.service";
import styles from "./TaskComponents.module.css";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: CreateTaskPayload) => void;
}

export default function CreateTaskModal({ isOpen, onClose, onSave }: CreateTaskModalProps) {
  const [taskName, setTaskName] = useState("");
  const [taskDesc, setTaskDesc] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      task_name: taskName,
      task_description: taskDesc,
      created_by: 2, // ലോഗിൻ ചെയ്ത അഡ്മിന്റെ താൽക്കാലിക ഐഡി
    });

    setTaskName("");
    setTaskDesc("");
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Create New Task Template</h2>
          <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label className={styles.label}>TASK NAME</label>
            <input type="text" value={taskName} onChange={(e) => setTaskName(e.target.value)} required placeholder="Task Name" className={styles.modalInput} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>TASK DESCRIPTION</label>
            <textarea value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} required placeholder="Brief description of the task..." className={`${styles.modalInput} ${styles.modalTextarea}`} rows={3} />
          </div>

          <div className={styles.modalActions}>
            <Button variant="outline" size="sm" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit">Create Template</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
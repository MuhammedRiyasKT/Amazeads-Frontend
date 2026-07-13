"use client";

import React, { useEffect, useState } from "react";
import MyTasksKPIs from "../components/DailyTasksKPIs";
import TaskChecklist from "../components/TaskChecklist";
import PendingReasonModal from "../components/PendingReasonModal";
import ViewReasonModal from "../components/ViewReasonModal"; // പുതിയ മോഡൽ ഇമ്പോർട്ട് ചെയ്യുന്നു
import { getAssignedTasks, trackTaskProgress, AssignedTask, TrackProgressPayload } from "../services/task.service";
import { useAuthStore } from "@/store/authStore";
import styles from "../components/DailyTasksComponents.module.css";

export default function ProjectManagerTasksPage() {
  const [tasks, setTasks] = useState<AssignedTask[]>([]);
  
  // മോഡൽ സ്റ്റേറ്റുകൾ
  const [isReasonOpen, setIsReasonOpen] = useState(false);
  const [isViewReasonOpen, setIsViewReasonOpen] = useState(false);
  
  const [selectedTaskForReason, setSelectedTaskForReason] = useState<AssignedTask | null>(null);
  const [selectedTaskForView, setSelectedTaskForView] = useState<AssignedTask | null>(null);

  const staffProfile = useAuthStore((state: any) => state.staff_profile || state.user);
  const staffId = staffProfile?.id || 3;

  const filterUniqueTasks = (rawTasks: AssignedTask[]): AssignedTask[] => {
    const uniqueMap: Record<number, AssignedTask> = {};
    rawTasks.forEach((task) => {
      const existing = uniqueMap[task.assignment_id];
      if (!existing || (task.progress_percentage || 0) >= (existing.progress_percentage || 0)) {
        uniqueMap[task.assignment_id] = task;
      }
    });
    return Object.values(uniqueMap);
  };

  const loadTasks = () => {
    getAssignedTasks(staffId)
      .then((data) => {
        const rawList = Array.isArray(data) ? data : [];
        setTasks(filterUniqueTasks(rawList));
      })
      .catch((err) => console.error("Error loading assigned tasks:", err));
  };

  useEffect(() => {
    loadTasks();
  }, [staffId]);

  const handleToggleTask = (task: AssignedTask) => {
    const isCompleted = task.tracking_status?.toLowerCase() === "completed";
    if (isCompleted) return;

    const isConfirmed = window.confirm("Are you sure you want to mark this task as completed?");
    if (!isConfirmed) return;

    const payload: TrackProgressPayload = {
      assignment_id: task.assignment_id,
      work_date: new Date().toISOString().substring(0, 10),
      work_description: "Completed via project manager daily checklist.",
      progress_percentage: 100,
      worked_hours: 1,
      task_status: "completed",
    };

    trackTaskProgress(task.assignment_id, payload)
      .then(() => loadTasks())
      .catch((err) => console.error("Error updating task status:", err));
  };

  const handleAddReasonClick = (task: AssignedTask) => {
    setSelectedTaskForReason(task);
    setIsReasonOpen(true);
  };

  // കാരണം വായിക്കാനുള്ള ബട്ടൺ ക്ലിക്ക് ഇവന്റ്
  const handleViewReasonClick = (task: AssignedTask) => {
    setSelectedTaskForView(task);
    setIsViewReasonOpen(true);
  };

  const handleSaveReason = (assignmentId: number, reason: string, date: string) => {
    const payload: TrackProgressPayload = {
      assignment_id: assignmentId,
      work_date: date,
      work_description: reason,
      progress_percentage: 0,    
      worked_hours: 0,
      task_status: "pending", 
    };

    trackTaskProgress(assignmentId, payload)
      .then(() => {
        setIsReasonOpen(false);
        setSelectedTaskForReason(null);
        loadTasks(); 
      })
      .catch((err) => console.error("Error saving pending reason:", err));
  };

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.tracking_status?.toLowerCase() === "completed").length;
  const pendingCount = totalCount - completedCount;

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Daily Tasks</h1>
        </div>
      </div>

      <MyTasksKPIs total={totalCount} completed={completedCount} pending={pendingCount} />

      <TaskChecklist 
        tasks={tasks} 
        onToggleTask={handleToggleTask} 
        onAddReasonClick={handleAddReasonClick}
        onViewReasonClick={handleViewReasonClick} // പുതിയ ഇവന്റ് പാസ്സ് ചെയ്യുന്നു
      />

      {/* കാരണം രേഖപ്പെടുത്താനുള്ള മോഡൽ */}
      <PendingReasonModal 
        isOpen={isReasonOpen}
        onClose={() => {
          setIsReasonOpen(false);
          setSelectedTaskForReason(null);
        }}
        task={selectedTaskForReason}
        onSave={handleSaveReason}
      />

      {/* രേഖപ്പെടുത്തിയ കാരണം വായിക്കാനുള്ള പുതിയ മോഡൽ */}
      <ViewReasonModal 
        isOpen={isViewReasonOpen}
        onClose={() => {
          setIsViewReasonOpen(false);
          setSelectedTaskForView(null);
        }}
        task={selectedTaskForView}
      />
    </div>
  );
}
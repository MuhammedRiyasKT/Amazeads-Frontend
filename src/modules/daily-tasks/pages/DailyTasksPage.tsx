"use client";

import React, { useEffect, useState } from "react";
import MyTasksKPIs from "../components/DailyTasksKPIs"; // പുതിയ ഡൈനാമിക് ഫയലുകൾ ഇമ്പോർട്ട് ചെയ്യുന്നു
import TaskChecklist from "../components/TaskChecklist";
import PendingReasonModal from "../components/PendingReasonModal";
import ViewReasonModal from "../components/ViewReasonModal";
import { getAssignedTasks, trackTaskProgress, AssignedTask, TrackProgressPayload } from "../services/task.service";
import { useAuthStore } from "@/store/authStore";
import styles from "../components/DailyTasksComponents.module.css"; // പുതിയ സി.എസ്.എസ് ഫയൽ

export default function ProjectManagerTasksPage() {
  const [tasks, setTasks] = useState<AssignedTask[]>([]);
  
  // മോഡൽ സ്റ്റേറ്റുകൾ
  const [isReasonOpen, setIsReasonOpen] = useState(false);
  const [isViewReasonOpen, setIsViewReasonOpen] = useState(false);
  
  const [selectedTaskForReason, setSelectedTaskForReason] = useState<AssignedTask | null>(null);
  const [selectedTaskForView, setSelectedTaskForView] = useState<AssignedTask | null>(null);

  // ലോക്കൽസ്റ്റോറേജിൽ നിന്നും എടുക്കാനുള്ള ഡൈനാമിക് സ്റ്റേറ്റുകൾ
  const [staffId, setStaffId] = useState<number>(3);
  const [userRole, setUserRole] = useState<string>("sales");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedId = localStorage.getItem("staffId");
      const savedRole = localStorage.getItem("userRole");
      if (savedId) setStaffId(parseInt(savedId));
      if (savedRole) setUserRole(savedRole);
    }
  }, []);

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
    if (staffId && userRole) {
      getAssignedTasks(userRole, staffId)
        .then((data) => {
          const rawList = Array.isArray(data) ? data : [];
          setTasks(filterUniqueTasks(rawList));
        })
        .catch((err) => console.error("Error loading assigned tasks:", err));
    }
  };

  useEffect(() => {
    if (staffId && userRole) {
      loadTasks();
    }
  }, [staffId, userRole]);

  const handleToggleTask = (task: AssignedTask) => {
    const isCompleted = task.tracking_status?.toLowerCase() === "completed";
    if (isCompleted) return;

    const isConfirmed = window.confirm("Are you sure you want to mark this task as completed?");
    if (!isConfirmed) return;

    const payload: TrackProgressPayload = {
      assignment_id: task.assignment_id,
      work_date: new Date().toISOString().substring(0, 10),
      work_description: "Completed via employee daily checklist.",
      progress_percentage: 100,
      worked_hours: 1,
      task_status: "completed",
    };

    trackTaskProgress(userRole, task.assignment_id, payload)
      .then(() => loadTasks())
      .catch((err) => console.error("Error updating task status:", err));
  };

  const handleAddReasonClick = (task: AssignedTask) => {
    setSelectedTaskForReason(task);
    setIsReasonOpen(true);
  };

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

    trackTaskProgress(userRole, assignmentId, payload)
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
        onViewReasonClick={handleViewReasonClick}
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
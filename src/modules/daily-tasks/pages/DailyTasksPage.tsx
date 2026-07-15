"use client";

import React, { useEffect, useState } from "react";
import MyTasksKPIs from "../components/DailyTasksKPIs";
import TaskChecklist from "../components/TaskChecklist";
import PendingReasonModal from "../components/PendingReasonModal";
import ViewReasonModal from "../components/ViewReasonModal";
import { getAssignedTasks, trackTaskProgress, AssignedTask, TrackProgressPayload } from "../services/task.service";
import { useAuthStore } from "@/store/authStore";
import styles from "../components/DailyTasksComponents.module.css";

export default function DailyTasksPage() {
  const [tasks, setTasks] = useState<AssignedTask[]>([]);
  
  // മോഡൽ സ്റ്റേറ്റുകൾ
  const [isReasonOpen, setIsReasonOpen] = useState(false);
  const [isViewReasonOpen, setIsViewReasonOpen] = useState(false);
  
  const [selectedTaskForReason, setSelectedTaskForReason] = useState<AssignedTask | null>(null);
  const [selectedTaskForView, setSelectedTaskForView] = useState<AssignedTask | null>(null);

  // 1. ജസ്റ്റാന്റ് സ്റ്റോറിൽ നിന്നും ആവശ്യമുള്ള വിവരങ്ങൾ മാത്രം നേരിട്ട് എടുക്കുന്നു
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated); // ഹൈഡ്രേഷൻ ട്രാക്കർ

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
    // 2. യൂസറും ടോക്കണും ഹൈഡ്രേഷൻ സ്റ്റാറ്റസും വാലിഡ് ആണെങ്കിൽ മാത്രം എപിഐ വിളിക്കുന്നു
    if (_hasHydrated && user && token) {
      getAssignedTasks(user.role_name, user.id)
        .then((data) => {
          const rawList = Array.isArray(data) ? data : [];
          setTasks(filterUniqueTasks(rawList));
        })
        .catch((err) => console.error("Error loading assigned tasks:", err));
    }
  };

  // ഹൈഡ്രേഷൻ പൂർത്തിയാകുമ്പോഴും യൂസർ മാറുമ്പോഴും ഡാറ്റ ലോഡ് ചെയ്യുന്നു
  useEffect(() => {
    if (_hasHydrated && user) {
      loadTasks();
    }
  }, [_hasHydrated, user, token]);

  // ജസ്റ്റാന്റ് ഹൈഡ്രേറ്റ് ചെയ്തു കഴിയുന്നത് വരെ ഒരു താൽക്കാലിക ലോഡിങ് സ്പിന്നർ കാണിക്കുന്നു (Hydration Guard)
  if (!_hasHydrated) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
      </div>
    );
  }

  // ലോഗിൻ ചെയ്യാത്ത യൂസർ ആണെങ്കിൽ തടയുന്നു
  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 min-h-screen text-slate-500 font-semibold">
        Please sign in to view your tasks.
      </div>
    );
  }

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

    trackTaskProgress(user.role_name, task.assignment_id, payload)
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

    trackTaskProgress(user.role_name, assignmentId, payload)
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

      <PendingReasonModal 
        isOpen={isReasonOpen}
        onClose={() => {
          setIsReasonOpen(false);
          setSelectedTaskForReason(null);
        }}
        task={selectedTaskForReason}
        onSave={handleSaveReason}
      />

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
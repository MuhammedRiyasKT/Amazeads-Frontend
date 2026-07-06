"use client";

import React, { useEffect, useState } from "react";
import MyTasksKPIs from "../components/MyTasksKPIs";
import MyTasksTable from "../components/MyTasksTable";
import TrackProgressModal from "../components/TrackProgressModal";
import { getAssignedTasks, trackTaskProgress, AssignedTask, TrackProgressPayload } from "../services/task.service";
import { useAuthStore } from "@/store/authStore";
import styles from "../components/MyTasksComponents.module.css";

export default function ProjectManagerTasksPage() {
  const [tasks, setTasks] = useState<AssignedTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<AssignedTask | null>(null);
  const [isTrackOpen, setIsTrackOpen] = useState(false);

  const staffProfile = useAuthStore((state: any) => state.staff_profile || state.user);
  const staffId = staffProfile?.id || 3;

  const loadTasks = () => {
    getAssignedTasks(staffId)
      .then((data) => {
        if (Array.isArray(data)) {
          // പ്രധാന മാറ്റം: ഒരേ assignment_id ഒന്നിലധികം തവണ വന്നാൽ അതിലെ ഏറ്റവും പുതിയ (അവസാനത്തെ) ഡാറ്റ മാത്രം എടുക്കുന്നു
          const uniqueTasksMap = new Map<number, AssignedTask>();
          data.forEach((item) => {
            uniqueTasksMap.set(item.assignment_id, item); // ഇത് പഴയ ഡാറ്റയെ മാറ്റി ഏറ്റവും പുതിയ ഡാറ്റ വെച്ച് റീപ്ലേസ് ചെയ്യും
          });
          setTasks(Array.from(uniqueTasksMap.values()));
        } else {
          setTasks([]);
        }
      })
      .catch((err) => console.error("Error loading assigned tasks:", err));
  };

  useEffect(() => {
    loadTasks();
  }, [staffId]);

  const handleTrackClick = (task: AssignedTask) => {
    setSelectedTask(task);
    setIsTrackOpen(true);
  };

  const handleSaveProgress = (payload: TrackProgressPayload) => {
    if (selectedTask) {
      trackTaskProgress(selectedTask.assignment_id, payload)
        .then(() => {
          setIsTrackOpen(false);
          setSelectedTask(null);
          loadTasks(); // ലോഗ് ചെയ്ത ഉടനെ ടേബിൾ പുതിയ പ്രോഗ്രസ്സുമായി അപ്ഡേറ്റ് ആകും
        })
        .catch((err) => console.error("Error logging work progress:", err));
    }
  };

  const inProgressCount = tasks.filter((t) => t.tracking_status === "In Progress" || t.assignment_status === "In Progress").length;

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Assigned Tasks</h1>
          <p className={styles.subtitle}>View your assigned tasks and update your daily progress log.</p>
        </div>
      </div>

      <MyTasksKPIs total={tasks.length} inProgress={inProgressCount} />

      <MyTasksTable tasks={tasks} onTrackClick={handleTrackClick} />

      <TrackProgressModal 
        isOpen={isTrackOpen} 
        onClose={() => {
          setIsTrackOpen(false);
          setSelectedTask(null);
        }} 
        task={selectedTask}
        onTrack={handleSaveProgress}
      />
    </div>
  );
}
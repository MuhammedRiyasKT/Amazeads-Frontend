"use client";

import React, { useEffect, useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import Button from "@/components/ui/Button";
import TaskKPIs from "../components/TaskKPIs";
import TaskFilters from "../components/TaskFilters";
import TaskTable from "../components/TaskTable";
import CreateTaskModal from "../components/CreateTaskModal";
import AssignTaskModal from "../components/AssignTaskModal";
import { 
  getTaskTracking, 
  createDailyTask, 
  assignTask, 
  TaskTracking, 
  CreateTaskPayload, 
  AssignTaskPayload 
} from "../services/task.service";
import styles from "../components/TaskComponents.module.css";

export default function DailyTasksPage() {
  const [trackingList, setTrackingList] = useState<TaskTracking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All Tasks");
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  // ട്രാക്കിംഗ് വിവരങ്ങൾ ഫെച്ച് ചെയ്യുന്നു
  const loadTrackingData = () => {
    getTaskTracking()
      .then((data) => setTrackingList(data))
      .catch((err) => console.error("Error loading task tracking:", err));
  };

  useEffect(() => {
    loadTrackingData();
  }, []);

  // പുതിയ ടാസ്ക് ടെംപ്ലേറ്റ് ക്രിയേറ്റ് ചെയ്യുന്നു
  const handleCreateTask = (payload: CreateTaskPayload) => {
    createDailyTask(payload)
      .then(() => {
        setIsCreateOpen(false);
        loadTrackingData();
      })
      .catch((err) => console.error("Error creating task:", err));
  };

  // ടാസ്ക് സ്റ്റാഫിലേക്ക് അസൈൻ ചെയ്യുന്നു
  const handleAssignTask = (payload: AssignTaskPayload) => {
    assignTask(payload)
      .then(() => {
        setIsAssignOpen(false);
        loadTrackingData();
      })
      .catch((err) => console.error("Error assigning task:", err));
  };

  // സെർച്ച് ഫിൽട്ടറിംഗ് ലോജിക്
  const filteredTasks = trackingList.filter((t) => {
    // ടാബ് ഫിൽട്ടർ
    if (activeTab === "Pending Tasks" && t.task_status === "Completed") return false;
    if (activeTab === "Completed" && t.task_status !== "Completed") return false;

    // സെർച്ച് ക്വറി
    const query = searchQuery.toLowerCase();
    return (
      t.task_name.toLowerCase().includes(query) ||
      t.staff_name.toLowerCase().includes(query)
    );
  });

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Daily Tasks</h1>
          <p className={styles.subtitle}>Create templates, assign, and track real-time task progress.</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus size={16} /> New Template
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsAssignOpen(true)}>
            <UserPlus size={16} /> Assign Task
          </Button>
        </div>
      </div>

      <TaskKPIs total={trackingList.length} />

      <TaskFilters 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <TaskTable tasks={filteredTasks} />

      {/* പുതിയ ടാസ്ക് ഉണ്ടാക്കാനുള്ള മോഡൽ */}
      <CreateTaskModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onSave={handleCreateTask} 
      />

      {/* സ്റ്റാഫിലേക്ക് ടാസ്ക് അസൈൻ ചെയ്യാനുള്ള മോഡൽ */}
      <AssignTaskModal 
        isOpen={isAssignOpen} 
        onClose={() => setIsAssignOpen(false)} 
        onAssign={handleAssignTask} 
      />
    </div>
  );
}
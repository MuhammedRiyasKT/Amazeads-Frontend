// src/modules/admin/services/task.service.ts

import api from "@/lib/axios";

export interface DailyTask {
  id: number;
  task_name: string;
  task_description: string;
  created_by: number;
  created_on: string;
  status: boolean;
}

export interface CreateTaskPayload {
  task_name: string;
  task_description: string;
  created_by: number;
}

export interface AssignTaskPayload {
  task_id: number;
  staff_id: number;
  assigned_by: number;
  start_date: string;
  end_date: string;
  priority: number;
}

export interface TaskTracking {
  assignment_id: number;
  staff_id: number;
  staff_name: string;
  role_name: string;
  task_id: number;
  task_name: string;
  task_description: string;
  start_date: string;
  end_date: string;
  priority: number;
  task_status: string;
  progress_percentage: number | null;
  worked_hours: number | null;
  work_description: string | null;
}

// 1. ടാസ്ക് ടെംപ്ലേറ്റുകൾ എടുക്കുന്നു
export const getDailyTasks = async (): Promise<DailyTask[]> => {
  const response = await api.get("/admin/daily-tasks");
  return response.data;
};

// 2. പുതിയ ടാസ്ക് ടെംപ്ലേറ്റ് ക്രിയേറ്റ് ചെയ്യുന്നു
export const createDailyTask = async (payload: CreateTaskPayload) => {
  const response = await api.post("/admin/daily-tasks", payload);
  return response.data;
};

// 3. സ്റ്റാഫിലേക്ക് ടാസ്ക് അസൈൻ ചെയ്യുന്നു
export const assignTask = async (payload: AssignTaskPayload) => {
  const response = await api.post("/admin/daily-tasks/assign", payload);
  return response.data;
};

// 4. ടാസ്ക് പുരോഗതിയും ട്രാക്കിംഗ് ലിസ്റ്റും എടുക്കുന്നു (Dashboard core)
export const getTaskTracking = async (): Promise<TaskTracking[]> => {
  const response = await api.get("/admin/daily-tasks/tracking");
  return response.data;
};
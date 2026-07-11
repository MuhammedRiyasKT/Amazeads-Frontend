// src/modules/admin/services/task.service.ts

import api from "@/lib/axios";

export interface SummaryFilters {
  work_date?: string;
  from_date?: string;
  to_date?: string;
  year?: number;
  month?: number;
  staff_id?: number;
}

export interface DailyTask {
  id: number;
  task_name: string;
  task_description: string;
  created_by: number;
  created_on: string;
  status: boolean;
}

export interface AssignTaskPayload {
  task_id: number;
  staff_id: number;
  assigned_by: number;
  start_date: string;
  end_date: string;
  priority: number;
}

export interface CreateAndAssignPayload {
  task_name?: string;
  task_description?: string;
  task_id?: number;
  staff_ids: number[]; // ഒന്നിലധികം സ്റ്റാഫുകളിലേക്ക് ഒരേസമയം അസൈൻ ചെയ്യാൻ
  assigned_by: number;
  start_date: string;
  end_date: string;
  priority: number;
  days: number[]; // ആഴ്ചയിലെ ദിവസങ്ങൾ: [1, 3, 5]
  created_by?: number;
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
}

export interface StaffSummary {
  assignment_id: number;
  staff_id: number;
  staff_name: string;
  role_name: string;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
}

// 1. ടാസ്ക് ടെംപ്ലേറ്റുകൾ ലോഡ് ചെയ്യുന്നു
export const getDailyTasks = async (): Promise<DailyTask[]> => {
  const response = await api.get("/admin/daily-tasks");
  return response.data;
};

// 2. പുതിയ കൺസോളിഡേറ്റഡ് അസൈൻമെന്റ് എപിഐ (പ്രധാന മാറ്റം!)
export const assignOrCreateTask = async (payload: CreateAndAssignPayload) => {
  const response = await api.post("/admin/daily-tasks/assignments/assign-or-create", payload);
  return response.data;
};

// 3. സ്റ്റാഫുകളുടെ ടാസ്ക് ലോഗ് വിവരങ്ങൾ ട്രാക്ക് ചെയ്യുന്നു
export const getTaskTracking = async (): Promise<TaskTracking[]> => {
  const response = await api.get("/admin/daily-tasks/tracking");
  return response.data;
};

// 4. സ്റ്റാഫ് ടാസ്ക് സമ്മറി ലിസ്റ്റ് എടുക്കുന്നു (ഡൈനാമിക് ഫിൽട്ടറുകൾ ചേർത്തു)
export const getStaffTaskSummary = async (filters?: SummaryFilters): Promise<StaffSummary[]> => {
  const response = await api.get("/admin/daily-tasks/staff-task-summary", {
    params: filters, // ഈ ഫിൽട്ടറുകളാണ് ബാക്ക്-എൻഡ് ക്വറി പാരാമീറ്ററുകളായി പോകുന്നത്
  });
  return response.data;
};
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
  flexible_status: boolean;
  days: number[]; // ആഴ്ചയിലെ ദിവസങ്ങൾ: [1, 3, 5]
  created_by?: number;
}

export interface StaffFlexibleSummary {
  staff_id: number;
  staff_name: string;
  role_name: string;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
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

export interface AssignmentOverviewItem {
  assignment_id: number;
  task_id: number;
  task_name: string;
  task_description: string;
  staff_id: number;
  staff_name: string;
  role_name: string;
  start_date: string;
  end_date: string;
  priority: number;
  assignment_status: string;
  flexible_status: boolean;
  scheduled_days: number[];
  evaluated_from: string;
  evaluated_to: string;
  total_scheduled_in_range: number;
  completed_count: number;
  pending_count: number;
  overdue_count: number;
}

export interface AssignmentsOverviewResponse {
  items: AssignmentOverviewItem[];
  pagination: {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
  };
}

export interface AssignmentFilters {
  work_date?: string;
  from_date?: string;
  to_date?: string;
  month?: number;
  year?: number;
  priority?: number;
  assignment_status?: string;
  staff_id?: number;
  task_id?: number;
  flexible_status?: boolean; 
  page?: number;
  page_size?: number;
}

// ദിവസം തിരിച്ചുള്ള സിംഗിൾ വർക്ക് ലോഗിന് വേണ്ടിയുള്ള ഇന്റർഫേസുകൾ
export interface DaywiseTrackingItem {
  work_date: string;
  task_status: string;
  progress_percentage: number | null;
  worked_hours: number | null;
  work_description: string | null;
  created_on: string | null;
  is_overdue: boolean;
}

export interface AssignmentDetails {
  assignment_id: number;
  task_id: number;
  task_name: string;
  task_description: string;
  staff_id: number;
  staff_name: string;
  role_name: string;
  start_date: string;
  end_date: string;
  priority: number;
  assignment_status: string;
  flexible_status: boolean;
  scheduled_days: number[];
  total_days: number;
  completed_days: number;
  pending_days: number;
  overdue_days: number;
  daywise_tracking: DaywiseTrackingItem[];
}

// 1. ടാസ്ക് ടെംപ്ലേറ്റുകൾ ലോഡ് ചെയ്യുന്നു
export const getDailyTasks = async (): Promise<DailyTask[]> => {
  const response = await api.get("/admin/daily-tasks");
  return response.data;
};

// 2. സ്റ്റാഫുകളുടെ ടാസ്ക് ലോഗ് വിവരങ്ങൾ ട്രാക്ക് ചെയ്യുന്നു
export const getTaskTracking = async (): Promise<TaskTracking[]> => {
  const response = await api.get("/admin/daily-tasks/tracking");
  return response.data;
};

// 3. സ്റ്റാഫ് ടാസ്ക് സമ്മറി ലിസ്റ്റ് എടുക്കുന്നു
export const getStaffTaskSummary = async (filters?: SummaryFilters): Promise<StaffSummary[]> => {
  const response = await api.get("/admin/daily-tasks/staff-task-summary", {
    params: filters,
  });
  return response.data;
};

// 4. അസൈൻമെന്റ് ഓവർവ്യൂ ലിസ്റ്റ് എടുക്കുന്നു
export const getAssignmentsOverview = async (filters: AssignmentFilters = {}): Promise<AssignmentsOverviewResponse> => {
  const response = await api.get("/admin/daily-tasks/assignments/overview", {
    params: {
      page_size: 5,
      ...filters
    }
  });
  return response.data.data;
};

// 5. ഒരു പ്രത്യേക അസൈൻമെന്റിന്റെ ദിവസം തിരിച്ചുള്ള ഫുൾ ട്രാക്കിംഗ് ലോഗുകൾ എടുക്കുന്നു
export const getAssignmentDetails = async (assignmentId: number): Promise<AssignmentDetails> => {
  const response = await api.get(`/admin/daily-tasks/assignments/${assignmentId}`);
  return response.data.data;
};

// 6. കൺസോളിഡേറ്റഡ് അസൈൻമെന്റ് എപിഐ (flexible_status അടങ്ങിയത്)
export const assignOrCreateTask = async (payload: CreateAndAssignPayload) => {
  const response = await api.post("/admin/daily-tasks/assignments/assign-or-create", payload);
  return response.data;
};

// 7. എക്സ്ട്രാ/ഫ്ലെക്സിബിൾ ടാസ്ക് സമ്മറി ഫെച്ച് ചെയ്യുന്നു
export const getStaffFlexibleTaskSummary = async (filters?: SummaryFilters): Promise<StaffFlexibleSummary[]> => {
  const response = await api.get("/admin/daily-tasks/staff-flexible-task-summary", {
    params: filters,
  });
  return response.data;
};
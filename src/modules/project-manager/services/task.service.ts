// src/modules/project-manager/services/task.service.ts

import api from "@/lib/axios";

export interface AssignedTask {
  assignment_id: number;
  task_id: number;
  task_name: string;
  task_description: string;
  start_date: string;
  end_date: string;
  priority: number;
  assignment_status: string;
  tracking_status: string;
  progress_percentage: number | null;
  work_description: string | null;
  work_date: string | null;
}

export interface TrackProgressPayload {
  assignment_id: number;
  work_date: string;
  work_description: string;
  progress_percentage: number;
  worked_hours: number;
  task_status: "Not Started" | "In Progress" | "Completed";
}

// 1. പ്രൊജക്റ്റ് മാനേജർക്ക് അസൈൻ ചെയ്യപ്പെട്ട ടാസ്കുകൾ ലിസ്റ്റ് ചെയ്യുന്നു (Dynamic staff_id വെച്ച്)
export const getAssignedTasks = async (staffId: number): Promise<AssignedTask[]> => {
  const response = await api.get("/project-manager/daily-tasks", {
    params: {
      staff_id: staffId // ലോഗിൻ ചെയ്ത യൂസറുടെ ഐഡി ഡൈനാമിക് ആയി അയക്കുന്നു
    }
  });
  return response.data;
};

// 2. അസൈൻ ചെയ്യപ്പെട്ട ടാസ്കിന്റെ പുരോഗതി ട്രാക്ക് ചെയ്ത് ലോഗ് ചെയ്യുന്നു
export const trackTaskProgress = async (assignmentId: number, payload: TrackProgressPayload) => {
  const response = await api.post(`/manager/daily-tasks/${assignmentId}/track`, payload);
  return response.data;
};
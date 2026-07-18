// src/modules/daily-tasks/services/task.service.ts

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
  flexible_status : boolean;
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
  task_status: "pending" | "completed";
}

// ലോഗിൻ ചെയ്ത ആളുടെ റോൾ അനുസരിച്ച് ശരിയായ എപിഐ റൂട്ട് കണ്ടെത്തുന്നു (പ്രധാന മാറ്റം!)
const getBaseUrlByRole = (role: string) => {
  const r = role.toLowerCase();
  if (r === "project manager" || r === "designer" || r === "project-manager") {
    return "/project-manager/daily-tasks";
  }
  if (r === "sales") {
    return "/sales/daily-tasks";
  }
  if (r === "printing") {
    return "/printing/daily-tasks";
  }
  if (r === "logistics") {
    return "/logistics/daily-tasks";
  }
  return `/${r}/daily-tasks`; // മറ്റ് റോളുകൾക്കുള്ള ഡിഫോൾട്ട് പാത്ത്
};

// 1. റോളിനും ഐഡിക്കും അനുസരിച്ച് ടാസ്കുകൾ ഡൈനാമിക് ആയി ഫെച്ച് ചെയ്യുന്നു
export const getAssignedTasks = async (role: string, staffId: number): Promise<AssignedTask[]> => {
  const baseUrl = getBaseUrlByRole(role);
  const response = await api.get(baseUrl, {
    params: { staff_id: staffId }
  });
  return response.data;
};

// 2. അസൈൻ ചെയ്യപ്പെട്ട ടാസ്കിന്റെ പുരോഗതി ഡൈനാമിക് ആയി ലോഗ് ചെയ്യുന്നു
export const trackTaskProgress = async (role: string, assignmentId: number, payload: TrackProgressPayload) => {
  const baseUrl = getBaseUrlByRole(role);
  const response = await api.post(`${baseUrl}/${assignmentId}/track`, payload);
  return response.data;
};
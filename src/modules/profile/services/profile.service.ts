// src/modules/profile/services/profile.service.ts

import api from "@/lib/axios";

export interface PersonalFilters {
  work_date?: string;
  from_date?: string;
  to_date?: string;
  month?: number;
  year?: number;
  priority?: number;
  assignment_status?: string;
  page?: number;
  page_size?: number;
}

export interface PersonalAssignment {
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
  completed_count: number;
  pending_count: number;
  overdue_count?: number;
  total_scheduled_in_range: number;
  scheduled_days: number[];
}

export interface PersonalAssignmentsResponse {
  items: PersonalAssignment[];
  pagination: {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
  };
}

// ലോഗിൻ ചെയ്ത ആളുടെ റോൾ അനുസരിച്ച് എപിഐ പാത്ത് ഡൈനാമിക് ആയി മാറുന്നു (പ്രധാന മാറ്റം!)
export const getPersonalAssignments = async (
  staffId: number, 
  role: string, // യൂസർ റോൾ ഇവിടെ പാരാമീറ്റർ ആയി വാങ്ങുന്നു
  filters: PersonalFilters = {}
): Promise<PersonalAssignmentsResponse> => {
  
  const r = role.toLowerCase();
  let endpoint = "/admin/daily-tasks/assignments/overview"; // Default fallback

  // റോൾ അനുസരിച്ച് എപിഐ അഡ്രസ്സ് മാറുന്നു
  if (r === "project manager" || r === "designer" || r === "project-manager") {
    endpoint = "/project-manager/daily-tasks/assignments/overview";
  } else if (r === "sales") {
    endpoint = "/sales/daily-tasks/assignments/overview";
  } else if (r === "printing") {
    endpoint = "/printing/daily-tasks/assignments/overview";
  }

  const response = await api.get(endpoint, {
    params: {
      staff_id: staffId,
      page_size: 5,
      ...filters
    }
  });
  return response.data.data;
};
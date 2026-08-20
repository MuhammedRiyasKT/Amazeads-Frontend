// src/modules/profile/types/index.ts

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

export interface KPIMetrics {
  total_tasks: number;
  completed: number;
  pending: number;
  overdue: number;
}

export interface ProfileDashboardKpis {
  dailyKpi: KPIMetrics;
  extraKpi: KPIMetrics;
}
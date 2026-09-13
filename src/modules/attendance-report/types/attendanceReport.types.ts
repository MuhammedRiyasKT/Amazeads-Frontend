// src/modules/attendance-report/types/attendanceReport.types.ts

export type ReportPeriod = "day" | "week" | "month" | "year";

export interface StaffReportItem {
  staff_id: number;
  staff_name: string;
  role_id?: number;
  role_name?: string;
  total_working_days: number;
  presents: number;
  absents: number;
  leave: number;
  holiday: number;
  halfday: number;
}

export interface AttendanceReportItem {
  id: number;
  name: string;
  date: string;
  from_date: string;
  to_date: string;
  status: string;
  total_staffs_count?: number;
  total_working_days: number;
  presents: number;
  absents: number;
  leave: number;
  holiday: number;
  halfday: number;
  staff_id?: number | null;
  staff_reports?: StaffReportItem[];
}

export interface AttendancePagination {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
}

export interface AttendanceReportResponse {
  success: boolean;
  message: string;
  data: {
    total_staffs_count?: number;
    items: AttendanceReportItem[];
    pagination: AttendancePagination;
  };
}

export interface AttendanceReportFilters {
  month?: number;
  year?: number;
  day?: number;
  date?: string;
  from_date?: string;
  to_date?: string;
  upto_today?: boolean;
  staff_id?: number;
  page?: number;
  page_size?: number;
}

export interface StaffOption {
  id: number;
  staff_name: string;
  email?: string;
  role_name?: string;
}


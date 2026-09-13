// src/modules/profile/types/personalAttendance.types.ts

export interface PersonalAttendanceReportItem {
  id: number;
  name: string;
  date: string;
  from_date: string;
  to_date: string;
  status: string;
  presents: number;
  absents: number;
  leave: number;
  holiday: number;
  total_working_days: number;
  halfday: number;
  staff_id: number;
}

export interface PersonalAttendancePagination {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
}

export interface PersonalAttendanceReportResponse {
  success: boolean;
  message: string;
  data: {
    items: PersonalAttendanceReportItem[];
    pagination: PersonalAttendancePagination;
  };
}

export interface PersonalAttendanceFilters {
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

export type PersonalReportPeriod = "day" | "week" | "month" | "year";

// Type definitions for TodayAttendanceCard
export interface SharedAttendanceStaff {
  staff_id?: number;
  staff_name?: string;
  department_name?: string;
  check_in?: string | null;
  check_out?: string | null;
  working_minutes?: number | null;
  worked_hours?: number | string | null;
  status: string;
  remarks?: string | null;
  leave_type?: string | null;
  leave_reason?: string | null;
}

export interface SharedAttendanceItem {
  attendance_date?: string;
  date?: string;
  holiday_name?: string | null;
  holiday_status?: boolean;
  is_optional_holiday?: boolean | null;
  total_present?: number;
  total_absent?: number;
  total_leave?: number;
  total_half_day?: number;
  staffs?: SharedAttendanceStaff[];
  staff_id?: number;
  staff_name?: string;
  department_name?: string;
  check_in?: string | null;
  check_out?: string | null;
  working_minutes?: number | null;
  worked_hours?: number | string | null;
  status?: string;
  remarks?: string | null;
  leave_type?: string | null;
  leave_reason?: string | null;
}

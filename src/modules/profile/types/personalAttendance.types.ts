// src/modules/profile/types/personalAttendance.types.ts

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
  // If backend flattens fields directly on item:
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

export interface SharedAttendancePagination {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
}

export interface SharedAttendanceData {
  items: SharedAttendanceItem[];
  pagination: SharedAttendancePagination;
  total_present?: number;
  total_absent?: number;
  total_leave?: number;
  total_half_day?: number;
}

export interface SharedAttendanceResponse {
  success?: boolean;
  message?: string;
  data: SharedAttendanceData;
}

export interface SharedAttendanceFilters {
  page?: number;
  page_size?: number;
  date?: string;
  month?: number | string;
  year?: number | string;
  from_date?: string;
  to_date?: string;
  role_id?: number | string;
  staff_name?: string;
  status?: string;
}

export type PersonalAttendanceState =
  | "NOT_CHECKED_IN"
  | "WORKING"
  | "COMPLETED"
  | "HOLIDAY"
  | "LEAVE";

// src/modules/hr/types/attendance.types.ts

export interface AttendanceStaff {
  staff_id: number;
  staff_name: string;
  department_name?: string;
  role_name?: string;
  check_in?: string | null;
  check_out?: string | null;
  working_minutes?: number | null;
  worked_hours?: string | null;
  status: string;
  remarks?: string | null;
  leave_type?: string | null;
  leave_reason?: string | null;
  attendance_date?: string;
}

export interface AttendancePagination {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
}

export interface AttendanceResponse {
  total_present: number;
  total_absent: number;
  total_leave: number;
  total_half_day: number;
  staffs: AttendanceStaff[];
  pagination: AttendancePagination;
}

export interface AttendanceFilters {
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

export interface Holiday {
  id?: number;
  holiday_name: string;
  holiday_date: string;
  is_optional: boolean;
}

export interface HolidayFilters {
  page?: number;
  page_size?: number;
  year?: number | string;
  month?: number | string;
  from_date?: string;
  to_date?: string;
  holiday_name?: string;
}

export interface HolidayResponse {
  items?: Holiday[];
  data?: Holiday[];
  pagination: AttendancePagination;
}

export interface ActiveStaff {
  id: number;
  staff_name: string;
  email: string;
  image_url?: string;
  address?: string;
  role_name: string;
  account_status: boolean;
  created_on?: string;
}

export interface CreateHolidayPayload {
  holiday_name: string;
  holiday_date: string;
  is_optional: boolean;
}

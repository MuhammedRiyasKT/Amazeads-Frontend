export type LeaveType = "Casual" | "Sick" | "Paid" | "Unpaid";
export type LeaveStatus =
  | "Pending"
  | "Manager Approved"
  | "HR Approved"
  | "Approved"
  | "Rejected";

export interface LeaveRequest {
  id: number;
  staff_id: number;
  leave_type: LeaveType;
  from_date: string;
  to_date: string;
  reason: string;
  status: LeaveStatus;
  manager_approved_by: number | null;
  manager_approved_at: string | null;
  hr_approved_by: number | null;
  hr_approved_at: string | null;
  admin_approved_by: number | null;
  admin_approved_at: string | null;
  staff_name: string;
  staff_role?: string;
  manager_name?: string | null;
  hr_name?: string | null;
  admin_name?: string | null;
  created_at: string;
}

export interface LeavePagination {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
}

export interface LeaveResponse {
  items: LeaveRequest[];
  pagination: LeavePagination;
}

export interface CreateLeavePayload {
  leave_type: LeaveType;
  from_date: string;
  to_date: string;
  reason: string;
}

// ഡൈനാമിക് ഫിൽട്ടർ ടൈപ്പ്സ്
export interface LeaveFilters {
  page?: number;
  page_size?: number;
  day?: number;
  month?: number;
  year?: number;
  from_date?: string;
  to_date?: string;
  staff_id?: number;
  admin_approved?: boolean;
  hr_approved?: boolean;
  manager_approved?: boolean;
  leave_type?: string;
}
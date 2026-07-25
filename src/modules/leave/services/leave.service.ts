import axiosInstance from "@/lib/axios";
import { LeaveResponse, LeaveRequest, CreateLeavePayload, LeaveFilters } from "../types";

export const getRoleSlug = (role: string): string => {
  return role.toLowerCase().trim().replace(/\s+/g, "-");
};

// 1. സ്റ്റാഫ് ലീവ് ലിസ്റ്റ്
export async function getStaffLeaves(
  roleName: string,
  staffId: number,
  page: number = 1,
  pageSize: number = 5
): Promise<LeaveResponse> {
  const slug = getRoleSlug(roleName);
  const response = await axiosInstance.get(`/${slug}/attendance/leaves`, {
    params: { staff_id: staffId, page, page_size: pageSize },
  });
  return response.data.data;
}

// 2. പുതിയ ലീവ് സബ്മിറ്റ് ചെയ്യാൻ
export async function submitLeaveRequest(
  roleName: string,
  staffId: number,
  payload: CreateLeavePayload
): Promise<LeaveRequest> {
  const slug = getRoleSlug(roleName);
  const response = await axiosInstance.post(`/${slug}/attendance/leaves?staff_id=${staffId}`, payload);
  return response.data.data;
}

// 3. HR-ന് ഫിൽട്ടർ സഹിതം എല്ലാ ലീവുകളും കാണാൻ
export async function getHRLeaves(filters: LeaveFilters): Promise<LeaveResponse> {
  const response = await axiosInstance.get(`/hr/attendance/all-leaves`, { params: filters });
  return response.data.data;
}

// 4. Admin-ന് ഫിൽട്ടർ സഹിതം എല്ലാ ലീവുകളും കാണാൻ
export async function getAdminLeaves(filters: LeaveFilters): Promise<LeaveResponse> {
  const response = await axiosInstance.get(`/admin/attendance/leaves`, { params: filters });
  return response.data.data;
}

// 5. Manager-ന് ഫിൽട്ടർ സഹിതം എല്ലാ ലീവുകളും കാണാൻ
export async function getManagerLeaves(filters: LeaveFilters): Promise<LeaveResponse> {
  const response = await axiosInstance.get(`/manager/attendance/all-leaves`, { params: filters });
  return response.data.data;
}

// HR Actions
export async function approveLeaveByHR(leaveId: number, hrStaffId: number): Promise<LeaveRequest> {
  const response = await axiosInstance.put(`/hr/attendance/leaves/${leaveId}/approve?hr_staff_id=${hrStaffId}`);
  return response.data.data;
}

export async function rejectLeaveByHR(leaveId: number, hrStaffId: number): Promise<LeaveRequest> {
  const response = await axiosInstance.put(`/hr/attendance/leaves/${leaveId}/reject?hr_staff_id=${hrStaffId}`);
  return response.data.data;
}

// Admin Actions
export async function approveLeaveByAdmin(leaveId: number, adminStaffId: number): Promise<LeaveRequest> {
  const response = await axiosInstance.put(`/admin/attendance/leaves/${leaveId}/approve?admin_staff_id=${adminStaffId}`);
  return response.data.data;
}

export async function rejectLeaveByAdmin(leaveId: number, adminStaffId: number): Promise<LeaveRequest> {
  const response = await axiosInstance.put(`/admin/attendance/leaves/${leaveId}/reject?admin_staff_id=${adminStaffId}`);
  return response.data.data;
}

// Manager Actions
export async function approveLeaveByManager(leaveId: number, managerStaffId: number): Promise<LeaveRequest> {
  const response = await axiosInstance.put(`/manager/attendance/leaves/${leaveId}/approve?manager_staff_id=${managerStaffId}`);
  return response.data.data;
}

export async function rejectLeaveByManager(leaveId: number, managerStaffId: number): Promise<LeaveRequest> {
  const response = await axiosInstance.put(`/manager/attendance/leaves/${leaveId}/reject?manager_staff_id=${managerStaffId}`);
  return response.data.data;
}
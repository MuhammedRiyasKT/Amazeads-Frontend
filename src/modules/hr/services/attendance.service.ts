// src/modules/hr/services/attendance.service.ts

import api from "@/lib/axios";
import {
  AttendanceFilters,
  AttendanceResponse,
  HolidayFilters,
  HolidayResponse,
  CreateHolidayPayload,
  ActiveStaff,
} from "../types/attendance.types";

/**
 * Utility to clean undefined, null, or empty string values from params object
 */
const cleanParams = (params: Record<string, any>) => {
  const cleaned: Record<string, any> = {};
  Object.keys(params).forEach((key) => {
    const val = params[key];
    if (val !== undefined && val !== null && val !== "") {
      cleaned[key] = val;
    }
  });
  return cleaned;
};

/**
 * Fetch Daily Attendance Logs with dynamic filters
 */
export async function getAttendanceLog(
  filters: AttendanceFilters
): Promise<AttendanceResponse> {
  const params = cleanParams(filters);
  const response = await api.get("/hr/attendance-log", { params });
  const rawData = response.data?.data || response.data || {};
  
  // Flatten nested staffs from date items
  const items = rawData.items || [];
  const flattenedStaffs: any[] = [];
  
  items.forEach((item: any) => {
    const staffs = item.staffs || [];
    staffs.forEach((staff: any) => {
      flattenedStaffs.push({
        ...staff,
        attendance_date: item.attendance_date,
        holiday_name: item.holiday_name,
        holiday_status: item.holiday_status,
        is_optional_holiday: item.is_optional_holiday,
      });
    });
  });

  return {
    total_present: rawData.total_present ?? 0,
    total_absent: rawData.total_absent ?? 0,
    total_leave: rawData.total_leave ?? 0,
    total_half_day: rawData.total_half_day ?? 0,
    staffs: flattenedStaffs.length > 0 ? flattenedStaffs : (rawData.staffs || []),
    pagination: rawData.pagination || {
      page: filters.page || 1,
      page_size: filters.page_size || 5,
      total_count: (rawData.items || []).length || (rawData.staffs || []).length,
      total_pages: 1,
    },
  };
}

/**
 * Individual Check-In
 */
export async function checkInStaff(
  checkInTime: string,
  staffId?: number
): Promise<any> {
  const payload: Record<string, any> = { check_in_time: checkInTime };
  if (staffId !== undefined && staffId !== null) {
    payload.staff_id = staffId;
  }
  const response = await api.post("/hr/attendance-log/check-in", payload);
  return response.data;
}

/**
 * Individual Check-Out
 */
export async function checkOutStaff(
  checkOutTime: string,
  staffId?: number
): Promise<any> {
  const payload: Record<string, any> = { check_out_time: checkOutTime };
  if (staffId !== undefined && staffId !== null) {
    payload.staff_id = staffId;
  }
  const response = await api.post("/hr/attendance-log/check-out", payload);
  return response.data;
}

/**
 * Bulk Check-In
 */
export async function bulkCheckInStaff(
  staffIds: number[],
  checkInTime: string
): Promise<any> {
  const response = await api.post("/hr/attendance-log/check-in-bulk", {
    staff_ids: staffIds,
    check_in_time: checkInTime,
  });
  return response.data;
}

/**
 * Bulk Check-Out
 */
export async function bulkCheckOutStaff(
  staffIds: number[],
  checkOutTime: string
): Promise<any> {
  const response = await api.post("/hr/attendance-log/check-out-bulk", {
    staff_ids: staffIds,
    check_out_time: checkOutTime,
  });
  return response.data;
}

/**
 * Get Staffs list for Attendance filtering/selection
 */
export async function getAttendanceStaffs(): Promise<ActiveStaff[]> {
  const response = await api.get("/hr/attendance-log/staffs");
  const data = response.data?.data || response.data || [];
  return Array.isArray(data) ? data : [];
}

/**
 * Get Holidays list with dynamic filters
 */
export async function getHolidays(
  filters: HolidayFilters
): Promise<HolidayResponse> {
  const params = cleanParams(filters);
  const response = await api.get("/hr/attendance-log/holidays", { params });
  const rawData = response.data?.data || response.data || {};
  const items = Array.isArray(rawData)
    ? rawData
    : rawData.items || rawData.holidays || [];

  return {
    items,
    data: items,
    pagination: rawData.pagination || {
      page: filters.page || 1,
      page_size: filters.page_size || 5,
      total_count: items.length,
      total_pages: 1,
    },
  };
}

/**
 * Add Holiday
 */
export async function addHoliday(payload: CreateHolidayPayload): Promise<any> {
  const response = await api.post("/hr/attendance-log/holidays", payload);
  return response.data;
}

/**
 * Update Holiday
 */
export async function updateHoliday(
  holidayId: number,
  payload: CreateHolidayPayload
): Promise<any> {
  const response = await api.put(
    `/hr/attendance-log/holidays/${holidayId}`,
    payload
  );
  return response.data;
}

/**
 * Delete Holiday
 */
export async function deleteHoliday(holidayId: number): Promise<any> {
  const response = await api.delete(
    `/hr/attendance-log/holidays/${holidayId}`
  );
  return response.data;
}

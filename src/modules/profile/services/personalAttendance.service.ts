// src/modules/profile/services/personalAttendance.service.ts

import api from "@/lib/axios";
import {
  SharedAttendanceFilters,
  SharedAttendanceResponse,
  SharedAttendanceData,
} from "../types/personalAttendance.types";

/**
 * Utility to clean empty/null/undefined query parameters before sending request
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
 * Fetch Personal Attendance Log using Shared Attendance API
 */
export async function getSharedAttendanceLog(
  filters: SharedAttendanceFilters = {}
): Promise<SharedAttendanceData> {
  const params = cleanParams(filters);
  const response = await api.get("/shared/attendance-log", { params });
  
  const rawData = response.data?.data || response.data || {};
  const items = Array.isArray(rawData)
    ? rawData
    : rawData.items || rawData.staffs || [];

  return {
    items,
    pagination: rawData.pagination || {
      page: filters.page || 1,
      page_size: filters.page_size || 5,
      total_count: items.length,
      total_pages: 1,
    },
    total_present: rawData.total_present ?? 0,
    total_absent: rawData.total_absent ?? 0,
    total_leave: rawData.total_leave ?? 0,
    total_half_day: rawData.total_half_day ?? 0,
  };
}

/**
 * Perform Personal Check-In using Shared Check-In API
 */
export async function sharedCheckIn(checkInTime: string): Promise<any> {
  const response = await api.post("/shared/attendance-log/check-in", {
    check_in_time: checkInTime,
  });
  return response.data;
}

/**
 * Perform Personal Check-Out using Shared Check-Out API
 */
export async function sharedCheckOut(checkOutTime: string): Promise<any> {
  const response = await api.post("/shared/attendance-log/check-out", {
    check_out_time: checkOutTime,
  });
  return response.data;
}

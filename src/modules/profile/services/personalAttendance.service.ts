// src/modules/profile/services/personalAttendance.service.ts

import api from "@/lib/axios";
import {
  PersonalReportPeriod,
  PersonalAttendanceFilters,
  PersonalAttendanceReportResponse,
} from "../types/personalAttendance.types";

/**
 * Utility to clean empty/null/undefined query parameters before sending request
 */
const cleanParams = (params: PersonalAttendanceFilters): Record<string, any> => {
  const cleaned: Record<string, any> = {};
  Object.keys(params).forEach((key) => {
    const val = params[key as keyof PersonalAttendanceFilters];
    if (val !== undefined && val !== null && val !== "") {
      cleaned[key] = val;
    }
  });
  return cleaned;
};

/**
 * Fetch Today's Attendance Log for Check-In/Check-Out status card
 */
export async function getTodayAttendanceLog(dateStr: string): Promise<any> {
  const response = await api.get("/shared/attendance-log", { params: { date: dateStr } });
  const rawData = response.data?.data || response.data || {};
  const items = Array.isArray(rawData) ? rawData : rawData.items || rawData.staffs || [];
  return {
    items,
    pagination: rawData.pagination,
  };
}

/**
 * Fetch Personal Attendance Report using Shared Attendance Report API
 */
export async function getPersonalAttendanceReport(
  period: PersonalReportPeriod,
  filters: PersonalAttendanceFilters = {}
): Promise<PersonalAttendanceReportResponse> {
  const endpoint = `/shared/attendance-report/by-${period}`;
  const params = cleanParams(filters);

  try {
    const response = await api.get<PersonalAttendanceReportResponse>(endpoint, { params });
    const resData = response.data;

    if (resData && resData.data && Array.isArray(resData.data.items)) {
      return resData;
    }

    const raw: any = response.data || {};
    return {
      success: raw.success ?? true,
      message: raw.message ?? "Fetched successfully",
      data: {
        items: raw.data?.items || raw.items || [],
        pagination: raw.data?.pagination || raw.pagination || {
          page: filters.page || 1,
          page_size: filters.page_size || 5,
          total_count: (raw.data?.items || raw.items || []).length,
          total_pages: 1,
        },
      },
    };
  } catch (err: any) {
    if (err.response?.status === 404) {
      try {
        const fallbackEndpoint = `/api/v1/shared/attendance-report/by-${period}`;
        const fallbackRes = await api.get<PersonalAttendanceReportResponse>(fallbackEndpoint, { params });
        return fallbackRes.data;
      } catch {
        // rethrow original
      }
    }
    throw err;
  }
}

export async function getPersonalAttendanceByDay(
  filters: PersonalAttendanceFilters = {}
): Promise<PersonalAttendanceReportResponse> {
  return getPersonalAttendanceReport("day", filters);
}

export async function getPersonalAttendanceByWeek(
  filters: PersonalAttendanceFilters = {}
): Promise<PersonalAttendanceReportResponse> {
  return getPersonalAttendanceReport("week", filters);
}

export async function getPersonalAttendanceByMonth(
  filters: PersonalAttendanceFilters = {}
): Promise<PersonalAttendanceReportResponse> {
  return getPersonalAttendanceReport("month", filters);
}

export async function getPersonalAttendanceByYear(
  filters: PersonalAttendanceFilters = {}
): Promise<PersonalAttendanceReportResponse> {
  return getPersonalAttendanceReport("year", filters);
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

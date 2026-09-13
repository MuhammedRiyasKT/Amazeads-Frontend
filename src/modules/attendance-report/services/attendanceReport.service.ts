// src/modules/attendance-report/services/attendanceReport.service.ts

import api from "@/lib/axios";
import {
  ReportPeriod,
  AttendanceReportFilters,
  AttendanceReportResponse,
  StaffOption,
} from "../types/attendanceReport.types";

/**
 * Clean parameters by omitting undefined, null, or empty string values
 */
const cleanParams = (params: AttendanceReportFilters): Record<string, any> => {
  const cleaned: Record<string, any> = {};
  Object.keys(params).forEach((key) => {
    const val = params[key as keyof AttendanceReportFilters];
    if (val !== undefined && val !== null && val !== "") {
      cleaned[key] = val;
    }
  });
  return cleaned;
};

/**
 * Fetch Attendance Report for given period (by-day, by-week, by-month, by-year)
 */
export async function getAttendanceReport(
  period: ReportPeriod,
  filters: AttendanceReportFilters
): Promise<AttendanceReportResponse> {
  const endpoints = [
    `/admin/staff-wise-attendance-report/by-${period}`,
    `/api/v1/admin/staff-wise-attendance-report/by-${period}`,
    `/admin/attendance-report/by-${period}`,
    `/api/v1/admin/attendance-report/by-${period}`,
  ];
  
  const params = cleanParams(filters);

  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i];
    try {
      const response = await api.get<AttendanceReportResponse>(endpoint, { params });
      const resData = response.data;
      
      if (resData && resData.data && Array.isArray(resData.data.items)) {
        return resData;
      }
      
      // Fallback if data is direct object
      const raw: any = response.data || {};
      const rawItems = raw.data?.items || raw.items || [];
      return {
        success: raw.success ?? true,
        message: raw.message ?? "Fetched successfully",
        data: {
          total_staffs_count: raw.data?.total_staffs_count || raw.total_staffs_count,
          items: rawItems,
          pagination: raw.data?.pagination || raw.pagination || {
            page: filters.page || 1,
            page_size: filters.page_size || 10,
            total_count: rawItems.length,
            total_pages: 1,
          },
        },
      };
    } catch (err: any) {
      if (err.response?.status === 404 && i < endpoints.length - 1) {
        continue;
      }
      if (i === endpoints.length - 1) {
        throw err;
      }
    }
  }

  throw new Error("Unable to fetch attendance report.");
}

export async function getAttendanceByDay(filters: AttendanceReportFilters): Promise<AttendanceReportResponse> {
  return getAttendanceReport("day", filters);
}

export async function getAttendanceByWeek(filters: AttendanceReportFilters): Promise<AttendanceReportResponse> {
  return getAttendanceReport("week", filters);
}

export async function getAttendanceByMonth(filters: AttendanceReportFilters): Promise<AttendanceReportResponse> {
  return getAttendanceReport("month", filters);
}

export async function getAttendanceByYear(filters: AttendanceReportFilters): Promise<AttendanceReportResponse> {
  return getAttendanceReport("year", filters);
}

/**
 * Fetch Staff options for the staff filter dropdown
 */
export async function getStaffOptions(role: string = "admin"): Promise<StaffOption[]> {
  const endpoints = [
    `/${role}/staffs`,
    "/admin/staffs",
    "/hr/staffs",
    "/hr/attendance-log/staffs",
  ];

  for (const ep of endpoints) {
    try {
      const response = await api.get(ep);
      const data = response.data?.data || response.data || [];
      const list = Array.isArray(data) ? data : data.items || [];
      
      if (Array.isArray(list) && list.length > 0) {
        return list
          .map((item: any) => ({
            id: Number(item.id || item.staff_id),
            staff_name: item.staff_name || item.name || item.username || `Staff #${item.id}`,
            email: item.email,
            role_name: String(item.role_name || item.role || item.role_title || ""),
          }))
          .filter((s) => {
            if (!s.id || !s.staff_name) return false;
            const r = (s.role_name || "").toLowerCase().trim();
            return r !== "admin" && !r.includes("admin");
          });
      }
    } catch {
      // try next endpoint
    }
  }

  return [];
}

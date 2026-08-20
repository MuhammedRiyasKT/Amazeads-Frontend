// src/modules/profile/services/profile.service.ts

import api from "@/lib/axios";
import {
  PersonalFilters,
  PersonalAssignment,
  PersonalAssignmentsResponse,
  KPIMetrics,
  ProfileDashboardKpis,
  AttendanceKPI,
} from "../types";

export type {
  PersonalFilters,
  PersonalAssignment,
  PersonalAssignmentsResponse,
  KPIMetrics,
  ProfileDashboardKpis,
  AttendanceKPI,
};

// 1. Get Personal Assignment History Log
export const getPersonalAssignments = async (
  staffId: number,
  role: string,
  filters: PersonalFilters = {}
): Promise<PersonalAssignmentsResponse> => {
  const r = (role || "").toLowerCase().trim();
  let endpoint = "/admin/daily-tasks/assignments/overview";

  if (r === "project manager" || r === "designer" || r === "designing" || r === "project-manager") {
    endpoint = "/project-manager/daily-tasks/assignments/overview";
  } else if (r === "sales") {
    endpoint = "/sales/daily-tasks/assignments/overview";
  } else if (r === "printing") {
    endpoint = "/printing/daily-tasks/assignments/overview";
  } else if (r === "production") {
    endpoint = "/production/daily-tasks/assignments/overview";
  } else if (r === "logistics") {
    endpoint = "/logistics/daily-tasks/assignments/overview";
  } else if (r === "hr") {
    endpoint = "/hr/daily-tasks/assignments/overview";
  } else if (r === "accounts") {
    endpoint = "/accounts/daily-tasks/assignments/overview";
  }

  const response = await api.get(endpoint, {
    params: {
      staff_id: staffId,
      page_size: 5,
      ...filters
    }
  });
  return response.data.data || response.data;
};

// 2. Centralized Role-to-API Prefix Normalized Mapper
export const getApiPrefixByRole = (roleName: string): string => {
  const r = (roleName || "").toLowerCase().trim();

  if (r === "sales") return "/sales";
  if (r === "project manager" || r === "project-manager") return "/project-manager";
  if (r === "designing" || r === "designer") return "/designer";
  if (r === "printing") return "/printing";
  if (r === "production") return "/production";
  if (r === "logistics") return "/logistics";
  if (r === "hr") return "/hr";
  if (r === "accounts") return "/accounts";
  if (r === "marketing") return "/marketing";
  if (r === "manager") return "/manager";

  return `/${r.replace(/\s+/g, "-")}`;
};

// 3. Helper to Build Generic Filter Payloads
export const buildPeriodFilters = (periodType: string, selectedDate: string, apiContext: "attendance" | "tasks"): any => {
  const d = new Date(selectedDate);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");

  if (periodType === "day") {
    return apiContext === "attendance" ? { date: selectedDate } : { work_date: selectedDate };
  }

  if (periodType === "week") {
    const dayOfWeek = d.getDay();
    const diffToMonday = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(new Date(d).setDate(diffToMonday));
    const sunday = new Date(new Date(monday).setDate(monday.getDate() + 6));

    return {
      from_date: monday.toISOString().split("T")[0],
      to_date: sunday.toISOString().split("T")[0]
    };
  }

  if (periodType === "month") {
    return { month, year };
  }

  if (periodType === "year") {
    return { year };
  }

  return {};
};

// 4. Fetch Daily Task KPI Metrics
export async function getProfileDailyTaskKPI(prefix: string, staffId?: number, filters: any = {}): Promise<KPIMetrics> {
  const params = { ...(staffId ? { staff_id: staffId } : {}), ...filters };
  const response = await api.get(`${prefix}/kpi-cards/daily-tasks`, { params });
  return response.data?.data || response.data || { total_tasks: 0, completed: 0, pending: 0, overdue: 0 };
}

// 5. Fetch Extra/Flexible Task KPI Metrics
export async function getProfileExtraTaskKPI(prefix: string, staffId?: number, filters: any = {}): Promise<KPIMetrics> {
  const params = { ...(staffId ? { staff_id: staffId } : {}), ...filters };
  const response = await api.get(`${prefix}/kpi-cards/flexible-daily-tasks`, { params });
  return response.data?.data || response.data || { total_tasks: 0, completed: 0, pending: 0, overdue: 0 };
}

// 6. Fetch Attendance KPI Metrics
export async function getProfileAttendanceKPI(prefix: string, staffId?: number, filters: any = {}): Promise<AttendanceKPI | undefined> {
  try {
    const params = { ...(staffId ? { staff_id: staffId } : {}), ...filters };
    // If no specific date filter is provided, use upto_today optionally (assumes if no period filter present, stick to default)
    if (Object.keys(filters).length === 0) {
      params.upto_today = true;
    }
    const response = await api.get(`${prefix}/kpi-cards/attendance`, { params });
    return response.data?.data || response.data;
  } catch (err) {
    console.error("Attendance KPI failed:", err);
    return undefined; // silently fail to prevent blocking task dashboard
  }
}

// 7. Combined Parallel KPI Fetcher (Promise.all)
export async function getProfileDashboardKpis(
  roleName: string,
  staffId: number,
  periodType: string = "day",
  selectedDate: string = new Date().toISOString().split("T")[0]
): Promise<ProfileDashboardKpis> {
  const prefix = getApiPrefixByRole(roleName);

  const taskFilters = buildPeriodFilters(periodType, selectedDate, "tasks");
  const attendanceFilters = buildPeriodFilters(periodType, selectedDate, "attendance");

  const [dailyKpi, extraKpi, attendanceKpi] = await Promise.all([
    getProfileDailyTaskKPI(prefix, staffId, taskFilters),
    getProfileExtraTaskKPI(prefix, staffId, taskFilters),
    getProfileAttendanceKPI(prefix, staffId, attendanceFilters),
  ]);

  return { dailyKpi, extraKpi, attendanceKpi };
}

// src/services/profileDashboard.service.ts
export * from "@/modules/profile/services/profile.service";
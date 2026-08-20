// src/modules/profile/services/profile.service.ts

import api from "@/lib/axios";
import {
  PersonalFilters,
  PersonalAssignment,
  PersonalAssignmentsResponse,
  KPIMetrics,
  ProfileDashboardKpis,
} from "../types";

export type {
  PersonalFilters,
  PersonalAssignment,
  PersonalAssignmentsResponse,
  KPIMetrics,
  ProfileDashboardKpis,
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

// 3. Fetch Daily Task KPI Metrics
export async function getProfileDailyTaskKPI(prefix: string, staffId?: number): Promise<KPIMetrics> {
  const params = staffId ? { staff_id: staffId } : {};
  const response = await api.get(`${prefix}/kpi-cards/daily-tasks`, { params });
  return response.data?.data || response.data || { total_tasks: 0, completed: 0, pending: 0, overdue: 0 };
}

// 4. Fetch Extra/Flexible Task KPI Metrics
export async function getProfileExtraTaskKPI(prefix: string, staffId?: number): Promise<KPIMetrics> {
  const params = staffId ? { staff_id: staffId } : {};
  const response = await api.get(`${prefix}/kpi-cards/flexible-daily-tasks`, { params });
  return response.data?.data || response.data || { total_tasks: 0, completed: 0, pending: 0, overdue: 0 };
}

// 5. Combined Parallel KPI Fetcher (Promise.all)
export async function getProfileDashboardKpis(
  roleName: string,
  staffId: number
): Promise<ProfileDashboardKpis> {
  const prefix = getApiPrefixByRole(roleName);

  const [dailyKpi, extraKpi] = await Promise.all([
    getProfileDailyTaskKPI(prefix, staffId),
    getProfileExtraTaskKPI(prefix, staffId),
  ]);

  return { dailyKpi, extraKpi };
}

// src/services/profileDashboard.service.ts
export * from "@/modules/profile/services/profile.service";
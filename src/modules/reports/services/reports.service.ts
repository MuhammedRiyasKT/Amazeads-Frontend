// src/modules/reports/services/reports.service.ts

import api from "@/lib/axios";
import {
  SalesExpenseReportParams,
  SalesExpenseReportResponse,
  SalesReportParams,
  SalesReportResponse,
  ExpenseReportParams,
  ExpenseReportResponse,
  StaffWiseReportParams,
  StaffWiseReportResponse,
} from "../types/reports.types";

export const getSalesExpenseReport = async (
  params: SalesExpenseReportParams
): Promise<SalesExpenseReportResponse> => {
  const { periodType = "day", ...restParams } = params;

  const path = `/accounts/sales-and-expense-report/by-${periodType}`;

  // Clean params dynamically: remove undefined, null, and empty strings
  const cleanedParams = Object.fromEntries(
    Object.entries(restParams).filter(
      ([_, val]) => val !== undefined && val !== null && val !== ""
    )
  );

  try {
    const res = await api.get<SalesExpenseReportResponse>(path, { params: cleanedParams });
    return res.data;
  } catch (err: any) {
    if (err?.response?.status === 404 && !path.startsWith("/api/v1")) {
      const res = await api.get<SalesExpenseReportResponse>(`/api/v1${path}`, { params: cleanedParams });
      return res.data;
    }
    throw err;
  }
};

export const getSalesCategories = async (): Promise<{ id: number; category_name: string }[]> => {
  try {
    const res = await api.get("/admin/products/categories");
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        id: item.id,
        category_name: item.category_name || item.name || `Category ${item.id}`,
      }));
    }
    return [];
  } catch {
    return [
      { id: 4, category_name: "crystal wall art" },
      { id: 5, category_name: "amaze-ads" },
    ];
  }
};

export const getExpenseCategories = async (): Promise<{ id: number; category_name: string }[]> => {
  try {
    const res = await api.get("/accounts/expense-categories");
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch {
    return [];
  }
};

export const getStaffList = async (
  roleFilter?: string
): Promise<{ id: number; staff_name: string; role_name?: string; department_name?: string }[]> => {
  const mapStaffItem = (item: any) => ({
    id: item.id,
    staff_name: item.staff_name || item.name || item.username || `Staff ${item.id}`,
    role_name: item.role_name || item.role || item.department_name || item.department || "",
    department_name: item.department_name || item.department || "",
  });

  const isMatchingRole = (item: any, targetRole: string) => {
    let val = item.role_name ?? item.department_name ?? item.department ?? item.role;
    if (typeof val === "object" && val !== null) {
      val = val.name || val.role_name || val.department_name || val.title || "";
    }
    const str = String(val || "").toLowerCase().trim();
    const target = targetRole.toLowerCase().trim();
    return str === target || str.includes(target);
  };

  try {
    const res = await api.get("/admin/staffs");
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) {
      const items = roleFilter ? data.filter((i: any) => isMatchingRole(i, roleFilter)) : data;
      return items.map(mapStaffItem);
    }
    return [];
  } catch {
    try {
      const res = await api.get("/hr/staffs");
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        const items = roleFilter ? data.filter((i: any) => isMatchingRole(i, roleFilter)) : data;
        return items.map(mapStaffItem);
      }
      return [];
    } catch {
      return [];
    }
  }
};

export const getSalesStaffList = async (): Promise<{ id: number; staff_name: string; role_name?: string }[]> => {
  return getStaffList("sales");
};


export const getSalesReport = async (
  params: SalesReportParams
): Promise<SalesReportResponse> => {
  const { periodType = "day", ...filters } = params;

  const endpoint = `/accounts/reports/by-${periodType}`;

  const queryParams = new URLSearchParams();

  if (filters.page) queryParams.set("page", String(filters.page));
  if (filters.page_size) queryParams.set("page_size", String(filters.page_size));
  if (filters.month) queryParams.set("month", String(filters.month));
  if (filters.year) queryParams.set("year", String(filters.year));
  if (filters.day) queryParams.set("day", String(filters.day));
  if (filters.date) queryParams.set("date", String(filters.date));
  if (filters.from_date) queryParams.set("from_date", String(filters.from_date));
  if (filters.to_date) queryParams.set("to_date", String(filters.to_date));
  if (filters.upto_today) queryParams.set("upto_today", "true");
  if (filters.category_id) queryParams.set("category_id", String(filters.category_id));
  if (filters.staff_id) queryParams.set("staff_id", String(filters.staff_id));

  const url = queryParams.toString() ? `${endpoint}?${queryParams.toString()}` : endpoint;

  try {
    const res = await api.get<SalesReportResponse>(url);
    return res.data;
  } catch (err: any) {
    if (err?.response?.status === 404 && !endpoint.startsWith("/api/v1")) {
      const fallbackUrl = queryParams.toString()
        ? `/api/v1${endpoint}?${queryParams.toString()}`
        : `/api/v1${endpoint}`;
      const res = await api.get<SalesReportResponse>(fallbackUrl);
      return res.data;
    }
    throw err;
  }
};

export const getExpenseReport = async (
  params: ExpenseReportParams
): Promise<ExpenseReportResponse> => {
  const { periodType = "day", ...filters } = params;

  let endpoint = `/accounts/new-expense-report/by-${periodType}`;
  if (periodType === "month") {
    endpoint = `/accounts/sales-and-expense-report/by-month`;
  } else if (periodType === "year") {
    endpoint = `/accounts/sales-and-expense-report/by-year`;
  }

  const queryParams = new URLSearchParams();

  if (filters.page) queryParams.set("page", String(filters.page));
  if (filters.page_size) queryParams.set("page_size", String(filters.page_size));
  if (filters.month) queryParams.set("month", String(filters.month));
  if (filters.year) queryParams.set("year", String(filters.year));
  if (filters.day) queryParams.set("day", String(filters.day));
  if (filters.date) queryParams.set("date", String(filters.date));
  if (filters.from_date) queryParams.set("from_date", String(filters.from_date));
  if (filters.to_date) queryParams.set("to_date", String(filters.to_date));
  if (filters.upto_today) queryParams.set("upto_today", "true");
  if (filters.expense_category_id) queryParams.set("expense_category_id", String(filters.expense_category_id));
  if (filters.staff_id) queryParams.set("staff_id", String(filters.staff_id));

  const url = queryParams.toString() ? `${endpoint}?${queryParams.toString()}` : endpoint;

  try {
    const res = await api.get<ExpenseReportResponse>(url);
    return res.data;
  } catch (err: any) {
    if (err?.response?.status === 404 && !endpoint.startsWith("/api/v1")) {
      const fallbackUrl = queryParams.toString()
        ? `/api/v1${endpoint}?${queryParams.toString()}`
        : `/api/v1${endpoint}`;
      const res = await api.get<ExpenseReportResponse>(fallbackUrl);
      return res.data;
    }
    throw err;
  }
};

export const getStaffWiseDailyReport = async (
  params: StaffWiseReportParams
): Promise<StaffWiseReportResponse> => {
  const endpoint = `/accounts/staff-wise-reports/by-day`;
  const queryParams = new URLSearchParams();

  if (params.date) queryParams.set("date", String(params.date));
  if (params.category_id) queryParams.set("category_id", String(params.category_id));
  if (params.staff_id) queryParams.set("staff_id", String(params.staff_id));

  const url = queryParams.toString() ? `${endpoint}?${queryParams.toString()}` : endpoint;

  try {
    const res = await api.get<StaffWiseReportResponse>(url);
    return res.data;
  } catch (err: any) {
    if (err?.response?.status === 404 && !endpoint.startsWith("/api/v1")) {
      const fallbackUrl = queryParams.toString()
        ? `/api/v1${endpoint}?${queryParams.toString()}`
        : `/api/v1${endpoint}`;
      const res = await api.get<StaffWiseReportResponse>(fallbackUrl);
      return res.data;
    }
    throw err;
  }
};

export const reportsService = {
  getSalesExpenseReport,
  getSalesCategories,
  getExpenseCategories,
  getStaffList,
  getSalesStaffList,
  getSalesReport,
  getExpenseReport,
  getStaffWiseDailyReport,
};

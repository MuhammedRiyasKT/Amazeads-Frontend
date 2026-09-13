// src/modules/accounts/services/accounts.service.ts

import api from "@/lib/axios";
import {
  AccountsSummaryParams,
  AccountsSummaryResponse,
  GenerateAccountsReportPayload,
  GenerateAccountsReportResponse,
  DailyAccountsReportParams,
  DailyAccountsReportResponse,
  WeeklyAccountsReportParams,
  MonthlyAccountsReportParams,
  YearlyAccountsReportParams,
  ExpenseCategory,
  ExpenseAccount,
  Expense,
  ExpenseListResponse,
  ExpenseKpi,
  ExpenseListParams,
  CreateExpensePayload,
  UpdateExpensePayload,
  SalesReportParams,
  SalesReportResponse,
  SalesExpenseReportParams,
  SalesExpenseReportResponse,
  ExpenseReportParams,
  ExpenseReportResponse,
} from "../types/accounts.types";
import { getStaffWiseDailyReport } from "../../reports/services/reports.service";


export const getDailyEntrySummary = async (): Promise<AccountsSummaryResponse> => {
  try {
    const res = await api.get<AccountsSummaryResponse>("/admin/accounts-report/summary");
    return res.data;
  } catch {
    const res = await api.get<AccountsSummaryResponse>("/accounts/accounts-report/summary");
    return res.data;
  }
};

export const getSummary = async (params?: AccountsSummaryParams): Promise<AccountsSummaryResponse> => {
  const res = await api.get<AccountsSummaryResponse>("/accounts/accounts-report/summary", { params });
  return res.data;
};

export const generateAccountsReport = async (
  payload: GenerateAccountsReportPayload
): Promise<GenerateAccountsReportResponse> => {
  const res = await api.post<GenerateAccountsReportResponse>("/accounts/accounts-report/generate-total", payload);
  return res.data;
};

export const listDailySummary = async (
  params?: DailyAccountsReportParams
): Promise<DailyAccountsReportResponse> => {
  const cleanedParams = params
    ? Object.fromEntries(
      Object.entries(params).filter(
        ([_, val]) => val !== undefined && val !== null && val !== ""
      )
    )
    : undefined;
  const res = await api.get<DailyAccountsReportResponse>("/accounts/accounts-report/list-daily-summary", {
    params: cleanedParams,
  });
  return res.data;
};

export const listWeeklySummary = async (
  params?: WeeklyAccountsReportParams
): Promise<DailyAccountsReportResponse> => {
  const cleanedParams = params
    ? Object.fromEntries(
      Object.entries(params).filter(
        ([_, val]) => val !== undefined && val !== null && val !== ""
      )
    )
    : undefined;
  const res = await api.get<DailyAccountsReportResponse>("/accounts/accounts-report/list-weekly-summary", {
    params: cleanedParams,
  });
  return res.data;
};

export const listMonthlySummary = async (
  params?: MonthlyAccountsReportParams
): Promise<DailyAccountsReportResponse> => {
  const cleanedParams = params
    ? Object.fromEntries(
      Object.entries(params).filter(
        ([_, val]) => val !== undefined && val !== null && val !== ""
      )
    )
    : undefined;
  const res = await api.get<DailyAccountsReportResponse>("/accounts/accounts-report/list-monthly-summary", {
    params: cleanedParams,
  });
  return res.data;
};

export const listYearlySummary = async (
  params?: YearlyAccountsReportParams
): Promise<DailyAccountsReportResponse> => {
  const cleanedParams = params
    ? Object.fromEntries(
      Object.entries(params).filter(
        ([_, val]) => val !== undefined && val !== null && val !== ""
      )
    )
    : undefined;
  const res = await api.get<DailyAccountsReportResponse>("/accounts/accounts-report/list-yearly-summary", {
    params: cleanedParams,
  });
  return res.data;
};

export const getExpenseCategories = async (): Promise<ExpenseCategory[]> => {
  const endpoints = [
    "/admin/expenses/categories",
    "/accounts/expense/categories",
    "/accounts/expense-categories",
    "/api/v1/admin/expenses/categories",
    "/api/v1/accounts/expense/categories",
  ];

  for (const path of endpoints) {
    try {
      const res = await api.get(path);
      const data = res.data?.data || res.data;
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch {
      // try next
    }
  }

  return [];
};

export const getExpenseAccounts = async (): Promise<ExpenseAccount[]> => {
  const res = await api.get<ExpenseAccount[]>("/accounts/expense/accounts");
  return res.data;
};

export const listExpenses = async (params?: ExpenseListParams): Promise<ExpenseListResponse> => {
  const cleanedParams = params
    ? Object.fromEntries(
      Object.entries(params).filter(
        ([_, val]) => val !== undefined && val !== null && val !== ""
      )
    )
    : undefined;
  const res = await api.get<ExpenseListResponse>("/accounts/expense", {
    params: cleanedParams,
  });
  return res.data;
};

export const getExpenseKpi = async (params?: ExpenseListParams): Promise<ExpenseKpi> => {
  const cleanedParams = params
    ? Object.fromEntries(
      Object.entries(params).filter(
        ([_, val]) => val !== undefined && val !== null && val !== ""
      )
    )
    : undefined;
  const res = await api.get<ExpenseKpi>("/accounts/expense/kpi-card", {
    params: cleanedParams,
  });
  return res.data;
};

export const getExpenseById = async (id: number): Promise<Expense> => {
  const res = await api.get<Expense>(`/accounts/expense/${id}`);
  return res.data;
};

export const createExpense = async (payload: CreateExpensePayload): Promise<Expense> => {
  const res = await api.post<Expense>("/accounts/expense", payload);
  return res.data;
};

export const updateExpense = async (id: number, payload: UpdateExpensePayload): Promise<Expense> => {
  const res = await api.put<Expense>(`/accounts/expense/${id}`, payload);
  return res.data;
};

export const deleteExpense = async (id: number): Promise<{ message?: string }> => {
  const res = await api.delete<{ message?: string }>(`/accounts/expense/${id}`);
  return res.data;
};

// ==========================================
// 4. SALES & EXPENSE REPORTS API
// ==========================================
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

export const getSalesTransactions = async (
  filters: Partial<{
    page?: number;
    page_size?: number;
    month?: string | number;
    year?: string | number;
    day?: string | number;
    date?: string;
    from_date?: string;
    to_date?: string;
    upto_today?: boolean;
    account_id?: number | string;
    in_out?: string;
    category_id?: number | string;
    expense_category_id?: number | string;
    staff_id?: number | string;
    search?: string;
  }> = {}
): Promise<any> => {
  const queryParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      queryParams.set(key, String(val));
    }
  });

  const queryStr = queryParams.toString();

  const endpoints = [
    "/admin/in-and-out/sales-transactions",
    "/accounts/in-and-out/sales-transactions",
    "/api/v1/admin/in-and-out/sales-transactions",
    "/api/v1/accounts/in-and-out/sales-transactions",
  ];

  let lastError: any = null;

  for (const endpoint of endpoints) {
    const url = queryStr ? `${endpoint}?${queryStr}` : endpoint;
    try {
      const res = await api.get(url);
      if (res.data) return res.data;
    } catch (err: any) {
      lastError = err;
      if (err?.response?.status !== 404) {
        throw err;
      }
    }
  }

  throw lastError;
};

export const accountsService = {
  getDailyEntrySummary,
  getSummary,
  generateAccountsReport,
  listDailySummary,
  listWeeklySummary,
  listMonthlySummary,
  listYearlySummary,
  getExpenseCategories,
  getExpenseAccounts,
  listExpenses,
  getExpenseKpi,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getSalesExpenseReport,
  getSalesCategories,
  getStaffList,
  getSalesStaffList,
  getSalesReport,
  getExpenseReport,
  getStaffWiseDailyReport,
  getSalesTransactions,
};
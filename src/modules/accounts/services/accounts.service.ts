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
  const res = await api.get<ExpenseCategory[]>("/accounts/expense/categories");
  return res.data;
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

export const getStaffList = async (): Promise<{ id: number; staff_name: string }[]> => {
  try {
    const res = await api.get("/admin/staffs");
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        id: item.id,
        staff_name: item.staff_name || item.name || item.username || `Staff ${item.id}`,
      }));
    }
    return [];
  } catch {
    try {
      const res = await api.get("/hr/staffs");
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          id: item.id,
          staff_name: item.staff_name || item.name || item.username || `Staff ${item.id}`,
        }));
      }
      return [];
    } catch {
      return [];
    }
  }
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
  getSalesReport,
  getExpenseReport,
};
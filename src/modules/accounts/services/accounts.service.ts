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
};
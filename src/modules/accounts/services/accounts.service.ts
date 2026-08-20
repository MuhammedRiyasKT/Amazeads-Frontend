// src/modules/accounts/services/accounts.service.ts

import api from "@/lib/axios";
import {
  Expense,
  ExpenseCategory,
  ExpenseAccount,
  ExpenseFilters,
  CreateExpensePayload,
  ExpensesListResponse,
  AccountsSummaryParams,
  AccountsSummaryResponse,
  GenerateAccountsReportPayload,
  GenerateAccountsReportResponse,
  AccountsReportQueryParams,
  AccountsReportListResponse,
  AccountReportItem,
  TotalReportsQueryParams,
  TotalReportsListResponse,
  GenerateTotalReportResponse,
} from "../types/accounts.types";

// ==========================================
// 1. EXPENSE CRUD FUNCTIONS
// ==========================================
export const getExpenses = async (params?: ExpenseFilters): Promise<ExpensesListResponse> => {
  const res = await api.get<ExpensesListResponse>("/expenses", { params });
  return res.data;
};

export const getExpenseById = async (id: number | string): Promise<Expense> => {
  const res = await api.get<Expense>(`/expenses/${id}`);
  return res.data;
};

export const getExpenseCategories = async (): Promise<ExpenseCategory[]> => {
  const res = await api.get<ExpenseCategory[]>("/expenses/categories");
  return res.data;
};

export const getExpenseAccounts = async (): Promise<ExpenseAccount[]> => {
  const res = await api.get<ExpenseAccount[]>("/accounts/list");
  return res.data;
};

export const createExpense = async (data: CreateExpensePayload): Promise<Expense> => {
  const res = await api.post<Expense>("/expenses", data);
  return res.data;
};

export const updateExpense = async (
  id: number | string,
  data: Partial<CreateExpensePayload> | CreateExpensePayload
): Promise<Expense> => {
  const res = await api.put<Expense>(`/expenses/${id}`, data);
  return res.data;
};

export const deleteExpense = async (id: number | string): Promise<{ message: string }> => {
  const res = await api.delete<{ message: string }>(`/expenses/${id}`);
  return res.data;
};

// ==========================================
// 2. ACCOUNTS REPORT FUNCTIONS
// ==========================================
export const getSummary = async (params?: AccountsSummaryParams): Promise<AccountsSummaryResponse> => {
  const res = await api.get<AccountsSummaryResponse>("/accounts/accounts-report/summary", { params });
  return res.data;
};

export const getSummaryByDate = async (report_date: string): Promise<AccountsSummaryResponse> => {
  const res = await api.get<AccountsSummaryResponse>(`/accounts/accounts-report/summary/${report_date}`);
  return res.data;
};

export const generateAccountsReport = async (
  payload: GenerateAccountsReportPayload
): Promise<GenerateAccountsReportResponse> => {
  const res = await api.post<GenerateAccountsReportResponse>("/accounts/accounts-report/generate", payload);
  return res.data;
};

export const generateTotalReport = async (
  payload: GenerateAccountsReportPayload
): Promise<GenerateTotalReportResponse> => {
  const res = await api.post<GenerateTotalReportResponse>("/accounts/accounts-report/generate-total", payload);
  return res.data;
};

export const getAccountsReports = async (
  params?: AccountsReportQueryParams
): Promise<AccountsReportListResponse> => {
  const res = await api.get<AccountsReportListResponse>("/accounts/accounts-report", { params });
  return res.data;
};

export const getTodayAccountsReport = async (): Promise<AccountReportItem[]> => {
  const res = await api.get<AccountReportItem[]>("/accounts/accounts-report/today");
  return res.data;
};

export const getAccountsReportByDate = async (report_date: string): Promise<AccountReportItem[]> => {
  const res = await api.get<AccountReportItem[]>(`/accounts/accounts-report/${report_date}`);
  return res.data;
};

export const getTotalReports = async (params?: TotalReportsQueryParams): Promise<TotalReportsListResponse> => {
  const res = await api.get<TotalReportsListResponse>("/accounts/accounts-report/total-reports", { params });
  return res.data;
};

export const accountsService = {
  getExpenses,
  getExpenseById,
  getExpenseCategories,
  getExpenseAccounts,
  createExpense,
  updateExpense,
  deleteExpense,
  getSummary,
  getSummaryByDate,
  generateAccountsReport,
  generateTotalReport,
  getAccountsReports,
  getTodayAccountsReport,
  getAccountsReportByDate,
  getTotalReports,
};
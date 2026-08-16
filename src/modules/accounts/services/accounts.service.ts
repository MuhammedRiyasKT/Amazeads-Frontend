// src/modules/accounts/services/accounts.service.ts

import api from "@/lib/axios";
import {
  SalesReport,
  SalesReportFilters,
  GenerateReportPayload,
  Expense,
  ExpenseCategory,
  ExpenseAccount,
  ExpenseFilters,
  CreateExpensePayload,
  UpdateExpensePayload,
  Pagination
} from "../types";

// ─── SALES REPORTS ENDPOINTS ──────────────────────────────────────────────────

export interface SalesReportListResponse {
  total_count: number;
  reports: SalesReport[];
}

// 1. Fetch Sales Reports
export async function getSalesReports(filters: SalesReportFilters = {}): Promise<SalesReportListResponse> {
  const params: Record<string, any> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params[key] = value;
    }
  });

  const response = await api.get<SalesReportListResponse>("/accounts/sales-report", { params });
  return response.data;
}

// 2. Generate Sales Report
export async function generateSalesReport(payload: GenerateReportPayload): Promise<SalesReport> {
  const response = await api.post<SalesReport>("/accounts/sales-report/generate", payload);
  return response.data;
}

// 3. Fetch Sales Report Detail by Date
export async function getSalesReportDetail(dateStr: string): Promise<SalesReport> {
  const response = await api.get<SalesReport>(`/accounts/sales-report/${dateStr}`);
  return response.data;
}


// ─── EXPENSES ENDPOINTS ───────────────────────────────────────────────────────

export interface ExpensesListResponse {
  items: Expense[];
  pagination: Pagination;
}

// 1. Fetch Expenses
export async function getExpenses(filters: ExpenseFilters = {}): Promise<ExpensesListResponse> {
  const params: Record<string, any> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params[key] = value;
    }
  });

  const response = await api.get<ExpensesListResponse>("/accounts/expenses", { params });
  return response.data;
}

// 2. Fetch Expense Categories
export async function getExpenseCategories(): Promise<ExpenseCategory[]> {
  const response = await api.get<ExpenseCategory[]>("/accounts/expenses/categories");
  return response.data;
}

// 3. Fetch Expense Accounts
export async function getExpenseAccounts(): Promise<ExpenseAccount[]> {
  const response = await api.get<ExpenseAccount[]>("/accounts/expenses/accounts");
  return response.data;
}

// 4. Fetch Expense Detail by ID (Singular /expense/)
export async function getExpenseById(id: number): Promise<Expense> {
  const response = await api.get<Expense>(`/accounts/expense/${id}`);
  return response.data;
}

// 5. Create Expense (Plural /expenses)
export async function createExpense(payload: CreateExpensePayload): Promise<Expense> {
  const response = await api.post<Expense>("/accounts/expenses", payload);
  return response.data;
}

// 6. Update Expense (Singular /expense/)
export async function updateExpense(id: number, payload: UpdateExpensePayload): Promise<Expense> {
  const response = await api.put<Expense>(`/accounts/expense/${id}`, payload);
  return response.data;
}

// 7. Delete Expense (Singular /expense/)
export async function deleteExpense(id: number): Promise<void> {
  await api.delete(`/accounts/expense/${id}`);
}

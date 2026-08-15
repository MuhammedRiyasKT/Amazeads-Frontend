// src/modules/expenses/services/expense.service.ts

import api from "@/lib/axios";
import { 
  Expense, 
  ExpenseCategory, 
  ExpenseAccount, 
  ExpenseFilters, 
  CreateExpensePayload, 
  UpdateExpensePayload 
} from "../types";

export interface ExpensesListResponse {
  items: Expense[];
  pagination: {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
  };
}

// 1. Fetch Expenses List with filters
export async function getExpenses(filters: ExpenseFilters = {}): Promise<ExpensesListResponse> {
  const params: Record<string, any> = {};
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params[key] = value;
    }
  });

  const response = await api.get<ExpensesListResponse>("/project-manager/expenses", { params });
  return response.data;
}

// 2. Fetch Expense Details
export async function getExpenseById(id: number): Promise<Expense> {
  const response = await api.get<Expense>(`/project-manager/expenses/${id}`);
  return response.data;
}

// 3. Fetch Expense Categories
export async function getExpenseCategories(): Promise<ExpenseCategory[]> {
  const response = await api.get<ExpenseCategory[]>("/project-manager/expenses/categories");
  return response.data;
}

// 4. Fetch Expense Accounts
export async function getExpenseAccounts(): Promise<ExpenseAccount[]> {
  const response = await api.get<ExpenseAccount[]>("/project-manager/expenses/accounts");
  return response.data;
}

// 5. Create Expense
export async function createExpense(payload: CreateExpensePayload): Promise<Expense> {
  const response = await api.post<Expense>("/project-manager/expenses", payload);
  return response.data;
}

// 6. Update Expense
export async function updateExpense(id: number, payload: UpdateExpensePayload): Promise<Expense> {
  const response = await api.put<Expense>(`/project-manager/expenses/${id}`, payload);
  return response.data;
}

// 7. Delete Expense
export async function deleteExpense(id: number): Promise<void> {
  await api.delete(`/project-manager/expenses/${id}`);
}

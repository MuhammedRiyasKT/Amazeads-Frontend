// src/modules/expenses/types/index.ts

export interface ExpenseCategory {
  id: number;
  category_name: string;
  description: string;
  status: boolean;
}

export interface ExpenseAccount {
  id: number;
  account_name: string;
}

export interface Expense {
  id: number;
  expense_category_id: number;
  category_name: string;
  category_description?: string;
  expense_date: string;
  amount: number;
  account_id: number;
  account_name: string;
  payment_type: "Cash" | "UPI" | "Bank Transfer" | string;
  description: string;
  attachment_url?: string | null;
  status: "Paid" | "Pending";
  created_by?: number;
  created_by_name?: string;
  created_on?: string;
  updated_by?: number;
  updated_by_name?: string;
  updated_on?: string;
}

export interface ExpensePagination {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
}

export interface ExpenseFilters {
  page?: number;
  page_size?: number;
  expense_category_id?: number;
  category_name?: string;
  from_date?: string;
  to_date?: string;
  expense_date?: string;
  day?: number;
  month?: number;
  year?: number;
  status?: "Paid" | "Pending" | string;
  account_id?: number;
  payment_type?: string;
  search?: string;
}

export interface CreateExpensePayload {
  expense_category_id: number;
  category_name: string;
  category_description?: string;
  expense_date: string;
  amount: number;
  account_id: number;
  payment_type: string;
  description: string;
  attachment_url: string | null;
  status: string;
}

export type UpdateExpensePayload = CreateExpensePayload;

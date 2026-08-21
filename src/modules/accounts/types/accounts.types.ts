// src/modules/accounts/types/accounts.types.ts

export type PeriodType = 'day' | 'week' | 'month' | 'year';

// ==========================================
// 1. EXPENSE TYPES (Matches existing UI components)
// ==========================================
export interface ExpenseCategory {
  id: number;
  category_name: string;
  name?: string;
  description?: string | null;
  created_on?: string;
  is_active?: boolean;
}

export interface ExpenseAccount {
  id: number;
  account_name: string;
  current_balance?: number;
  account_number?: string;
  bank_name?: string;
}

export interface Expense {
  id: number;
  expense_date: string;
  expense_category_id?: number;
  category_id?: number;
  category_name?: string;
  category_description?: string;
  account_id: number;
  account_name?: string;
  amount: number;
  payment_type?: string;
  description?: string;
  notes?: string;
  status?: string;
  attachment_url?: string | null;
  created_on?: string;
  created_by?: number;
  created_by_name?: string;
  updated_on?: string;
  updated_by_name?: string;
}

export interface ExpenseFilters {
  page?: number;
  page_size?: number;
  expense_category_id?: number;
  category_id?: number;
  account_id?: number;
  from_date?: string;
  to_date?: string;
  search?: string;
  status?: string;
  [key: string]: any;
}

export interface CreateExpensePayload {
  expense_date?: string;
  expense_category_id?: number;
  category_id?: number;
  account_id?: number;
  amount?: number;
  payment_type?: string;
  description?: string;
  notes?: string;
  status?: string;
  attachment_url?: string | null;
  [key: string]: any;
}

export interface ExpensesListResponse {
  items: Expense[];
  pagination?: {
    total_count: number;
    page: number;
    page_size: number;
  };
  total_count?: number;
}

// ==========================================
// 2. ACCOUNTS REPORT TYPES
// ==========================================
export interface AccountsSummaryParams {
  report_date?: string;
  day?: number;
  month?: number;
  year?: number;
  from_date?: string;
  to_date?: string;
  period_type?: PeriodType;
}

export interface AccountsSummaryData {
  date: string;
  total_orders: number;
  today_sales: number;
  today_collection: number;
  today_pending: number;
  total_sales: number;
  total_collection: number;
  total_pending: number;
  today_expenses: number;
  net_amount: number;
}

export interface AccountBreakdownItem {
  account_id: number;
  account_name: string;
  today_collection: number;
  today_expense: number;
  current_balance: number;
}

export interface AccountsSummaryResponse {
  summary: AccountsSummaryData;
  accounts_breakdown: AccountBreakdownItem[];
}

export interface AccountReportItem {
  id: number;
  account_id: number;
  account_name: string;
  sales_report_id?: number;
  expense_report_id?: number;
  date: string;
  today_sales: number;
  total_sales: number;
  today_expense: number;
  total_expense: number;
  current_balance: number;
  created_on: string;
  created_by: number;
}

export interface GenerateAccountsReportPayload {
  report_date: string;
}

export interface GenerateAccountsReportResponse {
  message: string;
  date: string;
  sales_report_id: number;
  expense_report_id: number;
  reports: AccountReportItem[];
}

export interface AccountsReportQueryParams {
  page?: number;
  page_size?: number;
  report_date?: string;
  account_id?: number;
  day?: number;
  month?: number;
  year?: number;
  from_date?: string;
  to_date?: string;
}

export interface AccountsReportSummaryTotals {
  today_sales_sum: number;
  total_sales_sum: number;
  today_expense_sum: number;
  total_expense_sum: number;
  net_balance_sum: number;
}

export interface AccountsReportListResponse {
  total_count: number;
  summary_totals: AccountsReportSummaryTotals;
  reports: AccountReportItem[];
}

export interface AccountLogItem {
  id: number;
  sales_report_id?: number;
  expense_report_id?: number;
  account_id: number;
  account_name: string;
  amount: number;
  total_amount: number;
  status: string;
  created_on: string;
  created_by: number;
}

export interface TotalSalesReport {
  id: number;
  date: string;
  status: string;
  orders: number;
  orders_ids: number[];
  sales_amount: number;
  cash_collection: number;
  today_orders_collection: number;
  today_orders_pending: number;
  total_orders: number;
  total_sales_amount: number;
  total_cash_collection: number;
  total_cash_pending: number;
  created_on: string;
  created_by: number;
  account_logs?: AccountLogItem[];
}

export interface TotalExpenseReport {
  id: number;
  date: string;
  status: string;
  expenses: number;
  category_ids: number[];
  expense_amount: number;
  total_expenses: number;
  total_expense_amount: number;
  created_on: string;
  created_by: number;
  account_logs?: AccountLogItem[];
}

export interface TotalReportItem {
  date: string;
  sales_report: TotalSalesReport | null;
  expense_report: TotalExpenseReport | null;
  accounts_report: AccountReportItem[];
}

export interface TotalReportsQueryParams {
  page?: number;
  page_size?: number;
  report_date?: string;
  day?: number;
  month?: number;
  year?: number;
  from_date?: string;
  to_date?: string;
}

export interface TotalReportsListResponse {
  total_count: number;
  reports: TotalReportItem[];
}

export interface GenerateTotalReportResponse {
  message: string;
  date: string;
  sales_report: TotalSalesReport;
  expense_report: TotalExpenseReport;
  accounts_report: {
    message: string;
    date: string;
    sales_report_id: number;
    expense_report_id: number;
    reports: AccountReportItem[];
  };
}
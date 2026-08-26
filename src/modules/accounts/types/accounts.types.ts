// src/modules/accounts/types/accounts.types.ts

export type PeriodType = 'day' | 'week' | 'month' | 'year';

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

export interface DailyAccountsSummary {
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
  // Additional summary fields for weekly, monthly, yearly reports
  period_type?: string;
  month_name?: string;
  year?: number;
  from_date?: string;
  to_date?: string;
}

export interface AccountBreakdown {
  account_id: number;
  account_name: string;
  today_collection: number;
  today_expense: number;
  current_balance: number;
}

export interface DailyAccountsReport {
  summary: DailyAccountsSummary;
  accounts_breakdown: AccountBreakdown[];
}

export interface DailyAccountsReportResponse {
  items: DailyAccountsReport[];
  reports: DailyAccountsReport[];
  total_count: number;
  pagination: {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
  };
}

export interface DailyAccountsReportParams {
  page: number;
  page_size: number;
  date?: string;
  day?: number;
  month?: number;
  year?: number;
  from_date?: string;
  to_date?: string;
}

export interface WeeklyAccountsReportParams {
  page: number;
  page_size: number;
  year?: number;
  month?: number;
  week?: number;
  from_date?: string;
  to_date?: string;
  upto_today?: boolean;
  upto?: boolean;
}

export interface MonthlyAccountsReportParams {
  page: number;
  page_size: number;
  year?: number;
  month?: number;
  from_date?: string;
  to_date?: string;
  upto_today?: boolean;
  upto?: boolean;
}

export interface YearlyAccountsReportParams {
  page: number;
  page_size: number;
  year?: number;
  from_date?: string;
  to_date?: string;
  upto_today?: boolean;
  upto?: boolean;
}

// ==========================================
// 3. EXPENSES TYPES
// ==========================================
export interface ExpenseCategory {
  id: number;
  category_name: string;
  description: string;
  status: boolean;
}

export interface ExpenseAccount {
  id: number;
  account_name: string;
  status: boolean;
  delete_status: boolean;
  created_by_id?: number;
  created_on?: string;
  updated_on?: string;
}

export interface Expense {
  id: number;
  expense_category_id: number;
  category_name: string;
  expense_date: string;
  amount: number;
  account_id: number;
  account_name: string;
  payment_type: string;
  description: string;
  attachment_url: string | null;
  status: string;
  created_by: number;
  created_by_name: string;
  created_on: string;
}

export interface ExpensePagination {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
}

export interface ExpenseListResponse {
  items: Expense[];
  pagination: ExpensePagination;
}

export interface ExpenseKpi {
  expense_count: number;
  total_expenses: number;
  expenses_count: number;
  total_amount: number;
  expense_amount: number;
  total_expense_amount: number;
  from_date: string | null;
  to_date: string | null;
}

export interface ExpenseListParams {
  page?: number;
  page_size?: number;
  from_date?: string;
  to_date?: string;
  expense_date?: string;
  day?: number;
  month?: string | number;
  year?: string | number;
  status?: string;
  account_id?: number | string;
  payment_type?: string;
  upto_today?: boolean;
}

export interface CreateExpensePayload {
  expense_category_id?: number;
  category_name: string;
  category_description?: string;
  expense_date: string;
  amount: number;
  account_id: number;
  payment_type: string;
  description?: string;
  attachment_url?: string;
  status: string;
}

export interface UpdateExpensePayload {
  expense_category_id?: number;
  category_name: string;
  category_description?: string;
  expense_date: string;
  amount: number;
  account_id: number;
  payment_type: string;
  description?: string;
  attachment_url?: string;
  status: string;
}



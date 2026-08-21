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


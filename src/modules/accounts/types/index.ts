// src/modules/accounts/types/index.ts

// ─── SALES REPORTS TYPES ──────────────────────────────────────────────────────

export interface SalesReportAccountLog {
  id?: number;
  sales_report_id?: number;
  account_id: number;
  account_name: string;
  amount: number;
  total_amount?: number;
  status?: string;
  created_on?: string;
  created_by?: number;
}

export interface SalesReport {
  id: number;
  date: string;
  orders: number;
  sales_amount: number;
  cash_collection: number;
  today_orders_collection?: number;
  today_orders_pending?: number;
  status: "Created" | string;

  // Overall Summary Metrics
  total_orders?: number;
  total_sales_amount?: number;
  total_cash_collection?: number;
  total_cash_pending?: number;

  // Account Logs & Associated Orders
  account_logs?: SalesReportAccountLog[];
  orders_ids?: number[];

  // Metadata
  created_by?: number;
  created_by_name?: string;
  created_on?: string;
  updated_by?: number | null;
  updated_by_name?: string | null;
  updated_on?: string | null;
  updated_orders_ids?: number[] | null;
}

export interface SalesReportFilters {
  page?: number;
  page_size?: number;
  report_date?: string;
  from_date?: string;
  to_date?: string;
  day?: number;
  month?: number;
  year?: number;
}

export interface GenerateReportPayload {
  report_date: string;
}


// ─── EXPENSES TYPES (Exported from accounts.types.ts) ──────────────────────────

export * from './accounts.types';

export type UpdateExpensePayload = import('../../expenses/types').CreateExpensePayload;


// ─── SHARED TYPES ─────────────────────────────────────────────────────────────

export interface Pagination {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
}

// src/modules/sales/types/reports.types.ts

export type SalesReportType = "daily" | "weekly" | "monthly" | "yearly";

export interface SalesReportItem {
  id: number;
  name: string;
  date: string;
  from_date: string;
  to_date: string;
  status: string;
  orders: number;
  orders_ids: number[];
  sales_amount: number;
  cash_collection: number;
  orders_collection: number;
  orders_pending: number;
  total_orders: number;
  total_sales_amount: number;
  total_cash_collection: number;
  total_cash_pending: number;
  created_by: number;
  updated_orders_ids: number[];
  total_sales_count: number;
  total_sales_value: number;
  total_pending_balance: number;
}

export interface SalesReportPagination {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
}

export interface SalesReportResponse {
  success: boolean;
  message?: string;
  data: {
    items: SalesReportItem[];
    pagination: SalesReportPagination;
  };
}

export interface SalesReportParams {
  page: number;
  page_size: number;
  year?: string;
  month?: string;
  day?: string;
  date?: string;
  from_date?: string;
  to_date?: string;
  upto_today?: boolean;
  category_id?: number;
}

export type PeriodOption =
  | "today"
  | "this_week"
  | "this_month"
  | "this_year"
  | "custom_date"
  | "custom_range"
  | "upto_today"
  | "";

// src/modules/reports/types/reports.types.ts

export type PeriodType = "day" | "week" | "month" | "year";

// ==========================================
// 1. COMBINED SALES & EXPENSE REPORT TYPES
// ==========================================
export interface SalesCategoryBreakdown {
  category_id: number;
  category_name: string;
  orders?: number;
  orders_ids?: number[];
  sales_amount?: number;
  cash_collection?: number;
  orders_collection?: number;
  orders_pending?: number;
  live_orders_collection?: number;
  live_orders_pending?: number;
  orders_cancelled?: number;
  cancelled_orders_amount?: number;
  total_orders?: number;
  total_sales_amount?: number;
  total_cash_collection?: number;
  total_cash_pending?: number;
  total_orders_cancelled?: number;
  total_cancelled_orders_amount?: number;
}

export interface ExpenseCategoryBreakdown {
  category_id: number;
  category_name: string;
  expenses_count?: number;
  expenses_ids?: number[];
  expense_amount?: number;
  total_expenses_count?: number;
  total_expense_amount?: number;
}

export interface AccountBreakdownItem {
  account_id: number;
  account_name: string;
  cash_collection: number;
  expense_amount: number;
  net_amount: number;
}

export interface SalesExpenseReportItem {
  id: number;
  name: string;
  date: string;
  from_date: string;
  to_date: string;
  status: string;

  orders: number;
  orders_ids?: number[];
  sales_amount: number;
  cash_collection: number;
  orders_collection: number;
  orders_pending: number;
  live_orders_collection?: number;
  live_orders_pending?: number;
  orders_cancelled: number;
  cancelled_orders_amount: number;

  expenses_count: number;
  expenses_ids?: number[];
  expense_amount: number;

  net_amount: number;

  sales_category_breakdown: SalesCategoryBreakdown[];
  expense_category_breakdown: ExpenseCategoryBreakdown[];
  account_breakdown: AccountBreakdownItem[];

  total_orders?: number;
  total_sales_amount?: number;
  total_cash_collection?: number;
  total_cash_pending?: number;
  total_orders_cancelled?: number;
  total_cancelled_orders_amount?: number;

  total_expenses_count?: number;
  total_expense_amount?: number;
  total_net_amount?: number;

  total_sales_category_breakdown?: SalesCategoryBreakdown[];
  total_expense_category_breakdown?: ExpenseCategoryBreakdown[];
  total_account_breakdown?: AccountBreakdownItem[];

  created_by?: any;
}

export interface SalesExpenseReportPagination {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
}

export interface SalesExpenseReportResponse {
  success: boolean;
  message: string;
  data: {
    items: SalesExpenseReportItem[];
    pagination: SalesExpenseReportPagination;
  };
}

export interface SalesExpenseReportParams {
  periodType?: PeriodType;
  page?: number;
  page_size?: number;
  month?: string | number;
  year?: string | number;
  day?: string | number;
  date?: string;
  from_date?: string;
  to_date?: string;
  upto_today?: boolean;
  category_id?: number | string;
  expense_category_id?: number | string;
  staff_id?: number | string;
}

// ==========================================
// 2. DEDICATED SALES REPORT TYPES
// ==========================================
export interface SalesReportCategoryBreakdown {
  category_id: number;
  category_name: string;
  orders: number;
  orders_ids?: number[];
  sales_amount: number;
  cash_collection: number;
  orders_collection: number;
  orders_pending: number;
  live_orders_collection?: number;
  live_orders_pending?: number;
  orders_cancelled: number;
  cancelled_orders_amount: number;
}

export interface TotalSalesCategoryBreakdown {
  category_id: number;
  category_name: string;
  total_orders: number;
  total_sales_amount: number;
  total_cash_collection: number;
  total_cash_pending: number;
  total_orders_cancelled: number;
  total_cancelled_orders_amount: number;
}

export interface SalesReportAccountBreakdown {
  account_id: number;
  account_name: string;
  cash_collection: number;
}

export interface TotalAccountBreakdown {
  account_id: number;
  account_name: string;
  cash_collection: number;
}

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
  live_orders_collection?: number;
  live_orders_pending?: number;
  orders_cancelled: number;
  cancelled_orders_amount: number;

  sales_category_breakdown: SalesReportCategoryBreakdown[];
  total_sales_category_breakdown: TotalSalesCategoryBreakdown[];
  account_breakdown: SalesReportAccountBreakdown[];
  total_account_breakdown: TotalAccountBreakdown[];

  total_orders: number;
  total_sales_amount: number;
  total_cash_collection: number;
  total_cash_pending: number;
  total_orders_cancelled: number;
  total_cancelled_orders_amount: number;

  created_by?: any;
  updated_orders_ids?: number[];
  total_sales_count?: number;
  total_sales_value?: number;
  total_pending_balance?: number;
}

export interface SalesReportPagination {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
}

export interface SalesReportResponse {
  success: boolean;
  message: string;
  data: {
    items: SalesReportItem[];
    pagination: SalesReportPagination;
  };
}

export interface SalesReportParams {
  periodType?: PeriodType;
  page?: number;
  page_size?: number;
  month?: string | number;
  year?: string | number;
  day?: string | number;
  date?: string;
  from_date?: string;
  to_date?: string;
  upto_today?: boolean;
  category_id?: number | string;
  staff_id?: number | string;
}

// ==========================================
// 3. DEDICATED EXPENSE REPORT TYPES
// ==========================================
export interface ExpenseReportCategoryBreakdown {
  category_id: number;
  category_name: string;
  expense_amount: number;
  expenses_count?: number;
  expenses_ids?: number[];
}

export interface TotalExpenseReportCategoryBreakdown {
  category_id: number;
  category_name: string;
  expense_amount: number;
  total_expenses_count?: number;
  expenses_count?: number;
  total_expense_amount?: number;
}

export interface ExpenseReportAccountBreakdown {
  account_id: number;
  account_name: string;
  expense_amount: number;
  cash_collection?: number;
  net_amount?: number;
}

export interface TotalExpenseReportAccountBreakdown {
  account_id: number;
  account_name: string;
  expense_amount: number;
  cash_collection?: number;
  net_amount?: number;
}

export interface ExpenseReportItem {
  id: number;
  name: string;
  date: string;
  from_date: string;
  to_date: string;
  status: string;

  expenses_count: number;
  expenses_ids: number[];
  expense_amount: number;

  category_breakdown?: ExpenseReportCategoryBreakdown[];
  total_category_breakdown?: TotalExpenseReportCategoryBreakdown[];

  expense_category_breakdown?: ExpenseReportCategoryBreakdown[];
  total_expense_category_breakdown?: TotalExpenseReportCategoryBreakdown[];

  account_breakdown: ExpenseReportAccountBreakdown[];
  total_account_breakdown: TotalExpenseReportAccountBreakdown[];

  total_expenses_count: number;
  total_expense_amount: number;

  created_by?: any;
  total_expenses_value?: number;
}

export interface ExpenseReportPagination {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
}

export interface ExpenseReportResponse {
  success: boolean;
  message: string;
  data: {
    items: ExpenseReportItem[];
    pagination: ExpenseReportPagination;
  };
}

export interface ExpenseReportParams {
  periodType?: PeriodType;
  page?: number;
  page_size?: number;
  month?: string | number;
  year?: string | number;
  day?: string | number;
  date?: string;
  from_date?: string;
  to_date?: string;
  upto_today?: boolean;
  expense_category_id?: number | string;
  staff_id?: number | string;
}

// ==========================================
// 4. STAFF-WISE DAILY REPORT TYPES
// ==========================================
export interface StaffReport {
  staff_id: number;
  staff_name: string;
  orders: number;
  orders_ids?: number[];
  sales_amount: number;
  cash_collection: number;
  orders_collection: number;
  orders_pending: number;
  live_orders_collection?: number;
  live_orders_pending?: number;
  orders_cancelled: number;
  cancelled_orders_amount: number;
  sales_category_breakdown?: SalesCategoryBreakdown[];
}

export interface StaffWiseReportItem {
  id: number;
  name: string;
  date: string;
  from_date: string;
  to_date: string;
  status: string;
  staff_reports: StaffReport[];
}

export interface StaffWiseReportPagination {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
}

export interface StaffWiseReportResponse {
  success: boolean;
  message: string;
  data: {
    items: StaffWiseReportItem[];
    pagination?: StaffWiseReportPagination;
  };
}

export interface StaffWiseReportParams {
  date?: string;
  category_id?: number | string;
  staff_id?: number | string;
}


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
  period_type?: string;
  month_name?: string;
  year?: number;
  from_date?: string;
  to_date?: string;
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

// ==========================================
// 4. SALES & EXPENSE REPORT TYPES
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
  // Cumulative breakdown properties
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
  expense_count?: number;
  expenses_count?: number;
  expenses_ids?: number[];
  expense_amount?: number;
  // Cumulative breakdown properties
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

  // Period values (Current report period)
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

  // Cumulative / Overall values
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
// 5. DEDICATED ACCOUNTS SALES REPORT TYPES
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

  // Period values
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

  // Cumulative / Overall values
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
// 6. DEDICATED ACCOUNTS EXPENSE REPORT TYPES
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

  // Period values
  expenses_count: number;
  expenses_ids: number[];
  expense_amount: number;

  // For DAY / WEEK response: category_breakdown
  category_breakdown?: ExpenseReportCategoryBreakdown[];
  total_category_breakdown?: TotalExpenseReportCategoryBreakdown[];

  // For MONTH / YEAR combined response: expense_category_breakdown
  expense_category_breakdown?: ExpenseReportCategoryBreakdown[];
  total_expense_category_breakdown?: TotalExpenseReportCategoryBreakdown[];

  account_breakdown: ExpenseReportAccountBreakdown[];
  total_account_breakdown: TotalExpenseReportAccountBreakdown[];

  // Cumulative / Overall values
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
// 7. IN & OUT SALES TRANSACTION TYPES
// ==========================================
export interface SalesTransaction {
  id: number;
  date: string;
  in_out: "IN" | "OUT" | string;
  amount: number;
  description: string;
}

export interface AccountTransactionBreakdown {
  account_id: number;
  account_name: string;
  total_in_amount: number;
  in_transaction_count: number;
  total_out_amount: number;
  out_transaction_count: number;
  net_amount: number;
  total_transaction_count: number;
}

export interface TransactionPagination {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
}

export interface SalesTransactionData {
  items: SalesTransaction[];
  total_in_amount: number;
  total_out_amount: number;
  net_amount: number;
  total_transaction_count: number;
  accounts_breakdown: AccountTransactionBreakdown[];
  pagination: TransactionPagination;
}

export interface SalesTransactionResponse {
  success: boolean;
  message: string;
  data: SalesTransactionData;
}

export interface SalesTransactionFilters {
  page?: number;
  page_size?: number;
  month?: string | number;
  year?: string | number;
  day?: string | number;
  date?: string;
  from_date?: string;
  to_date?: string;
  upto_today?: boolean;
  account_id?: number | string;
  in_out?: string;
  category_id?: number | string;
  expense_category_id?: number | string;
  staff_id?: number | string;
  search?: string;
}

export * from "../../reports/types/reports.types";



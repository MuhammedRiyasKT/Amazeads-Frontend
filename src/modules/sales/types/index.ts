export interface ProductRow {
  id: string;
  productName: string;
  section: string;
  imageUrl: string;
  qty: number;
  price: number;
  addlAmt: number;
}

export interface OrderItem {
  productName: string;
  qty: number;
  status: "ORDER" | "PROJECT";
}

export interface Order {
  id: string;
  orderId?: string;
  date: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  paymentStatus: "PAID" | "DUE" | "PARTIAL";
  paidAmount?: number;
  dueAmount?: number;
  isToday?: boolean;
  isConverted?: boolean;
  isPending?: boolean;
}

export interface Customer {
  id: number;
  customer_name: string;
  mobile_number: string;
  whatsapp_number: string;
  requirements: string;
  status: string;
}

export interface Address {
  id?: number;
  address_type: "Billing" | "Delivery";
  address_line_1: string;
  address_line_2: string;
  district: string;
  state: string;
  country: string;
  pincode: string;
  is_default: boolean;
}

export interface SalesProductPrice {
  product_name: string;
  item_code: string;
  selling_price: number;
}

export interface ProjectDepartment {
  id: number;
  department_name: string;
  status: boolean;
}

export interface DeliveryType {
  id: number;
  name: string;
  status: boolean;
}

export interface SalesPriceCategory {
  id: number;
  price_category_name: string;
  status: boolean;
}

export interface OrderProjectPayload {
  id?: number;
  product_id?: number;
  quantity: number;
  unit_price: number;
  amount: number;
  additional_amount: number;
  project_name: string;
  description: string;
  status: "Created" | "Pending" | "Confirmed" | "Completed";
  design_date: string | null;
  printing_date: string | null;
  completed_date: string | null;
  department_ids: number[];
  project_images?: Array<{ img_url: string; platform_name: string; status: boolean }>;
}

export interface CreateOrderPayload {
  customer_id: number;
  customer?: Omit<Customer, "id">;
  billing_address_id: number;
  billing_address?: Omit<Address, "id">;
  delivery_address_id: number;
  delivery_address?: Omit<Address, "id">;
  delivery_type_id: number;
  expected_delivery_days: number | null;
  order_date: string;
  commit_date: string;
  design_date: string | null;
  print_date: string | null;
  completion_date: string | null;
  total_orders: number;
  discount_amount: number;
  final_amount: number;
  paid_amount: number;
  balance_amount: number;
  total_amount: number;
  total_units: number;
  payment_status: "Pending" | "Partial" | "Paid";
  is_quotation: boolean;
  order_status: "Draft" | "Confirmed" | "Completed";
  remarks: string;
  product_price_category_id: number;
  account_id: number;
  payment_type?: string;
  order_type?: string;
  category_id?: number;
  projects: OrderProjectPayload[];
}

export interface OrderItemResponse {
  id: number;
  order_number: string | null;
  customer_id: number;
  customer_name: string;
  customer_mobile_number: string;
  customer_whatsapp_number?: string;
  order_date: string;
  commit_date?: string;
  completion_date?: string;
  order_status: string;
  payment_status: string;
  is_quotation: boolean;
  delivery_type_id: number | null;
  delivery_type_name: string | null;
  product_price_category_id: number;
  price_category_name: string;
  account_id?: number | null;
  account_name?: string | null;
  total_amount: number;
  discount_amount?: number;
  final_amount: number;
  paid_amount: number;
  balance_amount: number;
  total_units: number;
  created_by: number;
  created_on: string;
  payment_type?: string | null;
  remarks?: string;
  billing_address?: Address | null;
  shipping_address?: Address | null;
  projects: any[];
}

export interface OrderListResponse {
  items: OrderItemResponse[];
  pagination: {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
  };
}

export interface SalesKpiData {
  id: number;
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

export interface SalesKpiCardsResponse {
  success: boolean;
  message?: string;
  data: SalesKpiData;
}

export interface SalesOrderStatusData {
  quotations: number;
  new_orders: number;
  ongoing_orders: number;
  order_to_close: number;
  orders_to_close: number;
  closed_orders: number;
  closed: number;
  cancelled: number;
  cancelled_orders: number;
  total_orders: number;
  from_date: string;
  to_date: string;
  created_by: number;
}

export interface SalesOrderStatusResponse {
  success: boolean;
  message?: string;
  data: SalesOrderStatusData;
}

export interface SalesPaymentStatusData {
  paid_orders: number;
  paid: number;
  not_paid_orders: number;
  not_paid: number;
  balance_pending_orders: number;
  partial_orders: number;
  partial: number;
  total_orders: number;
  from_date: string;
  to_date: string;
  created_by: number;
}

export interface SalesPaymentStatusResponse {
  success: boolean;
  message?: string;
  data: SalesPaymentStatusData;
}

export interface SalesOverviewFilters {
  date?: string;
  month?: string;
  year?: string;
  day?: string;
  from_date?: string;
  to_date?: string;
  upto_today?: boolean;
}

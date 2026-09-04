import api from "@/lib/axios";
import {
  DeliveryType,
  SalesPriceCategory,
  ProjectDepartment,
  SalesProductPrice,
  CreateOrderPayload,
  OrderListResponse
} from "../types";

export const getRoleSlug = (role: string): string => {
  return role.toLowerCase().trim().replace(/\s+/g, "-");
};

// 1. Get Orders / Quotations List
export async function getOrdersList(filters?: any): Promise<OrderListResponse> {
  const response = await api.get("/sales/orders", { params: filters });
  return response.data;
}

// 2. Get Order or Quotation Details by ID
export async function getOrderById(id: number, role: string = "sales"): Promise<any> {
  const response = await api.get(`/${role}/orders/${id}`);
  return response.data;
}

// 3. Create Normal Sales Order (POST /sales/orders/)
export async function createSalesOrder(payload: CreateOrderPayload): Promise<any> {
  const response = await api.post("/sales/orders/", payload);
  return response.data;
}

// 4. Update Normal Sales Order (PUT /sales/orders/{id})
export async function updateSalesOrder(id: number, payload: CreateOrderPayload): Promise<any> {
  const response = await api.put(`/sales/orders/${id}`, payload);
  return response.data;
}

// 5. Create Sales Quotation (POST /sales/quotations/)
export async function createSalesQuotation(payload: CreateOrderPayload): Promise<any> {
  const response = await api.post("/sales/quotations/", payload);
  return response.data;
}

// 6. Update Sales Quotation (PUT /sales/quotations/{id})
export async function updateSalesQuotation(id: number, payload: any): Promise<any> {
  const response = await api.put(`/sales/quotations/${id}`, payload);
  return response.data;
}

// 7. Search Customers By Mobile
export async function searchCustomersByMobile(mobileNumber?: string): Promise<Array<{ id: number; mobile_number: string }>> {
  const response = await api.get("/sales/orders/customers", {
    params: mobileNumber ? { mobile_number: mobileNumber } : undefined,
  });
  return response.data;
}

// 8. Get Single Customer Details
export async function getCustomerDetails(id: number): Promise<any> {
  const response = await api.get(`/sales/orders/customers/${id}`);
  return response.data;
}

// 9. Get Project Departments
export async function getOrderDepartments(): Promise<ProjectDepartment[]> {
  const response = await api.get("/sales/orders/departments");
  return response.data;
}

// 10. Get Delivery Types
export async function getDeliveryTypes(): Promise<DeliveryType[]> {
  const response = await api.get("/sales/orders/delivery-types");
  return response.data;
}

// 11. Get Sales Price Categories
export async function getSalesPriceCategories(): Promise<SalesPriceCategory[]> {
  const response = await api.get("/sales/products/price-categories");
  return response.data.data;
}

// 12. Get Product Prices by Category
export async function getProductPricesByCat(priceCatId: number, categoryId: number): Promise<{ products: SalesProductPrice[] }> {
  const response = await api.get("/sales/orders/products/prices", {
    params: { price_category_id: priceCatId, category_id: categoryId }
  });
  return response.data;
}

// 13. Get Delivered Orders
export async function getDeliveredOrders(page: number = 1, pageSize: number = 5): Promise<any> {
  const response = await api.get("/sales/orders", {
    params: {
      page,
      page_size: pageSize,
      order_status: "Delivered",
    },
  });
  return response.data;
}

// 14. Close Sales Order
export async function closeSalesOrder(orderId: number): Promise<any> {
  const response = await api.patch(`/sales/orders/${orderId}/close`);
  return response.data;
}

// 15. Get Sales Accounts
export async function getSalesAccounts(): Promise<any[]> {
  const response = await api.get("/sales/orders/accounts");
  return response.data;
}

// 16. Get Order Payment Details
export async function getOrderPaymentDetails(orderId: number): Promise<any> {
  const response = await api.get(`/sales/orders/${orderId}/payment`);
  return response.data;
}

// 17. Update Order Payment
export async function updateOrderPayment(
  orderId: number,
  payload: { paid_amount: number; payment_status: string; account_id: number }
): Promise<any> {
  const response = await api.put(`/sales/orders/${orderId}/payment`, payload);
  return response.data;
}

// 18. Cancel Sales Order
export async function cancelSalesOrder(orderId: number): Promise<any> {
  const response = await api.patch(`/sales/orders/${orderId}/cancel`, {
    id: orderId,
    order_status: "Cancel",
  });
  return response.data;
}

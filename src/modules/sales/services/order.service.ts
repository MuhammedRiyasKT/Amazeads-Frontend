import api from "@/lib/axios";
import { 
  Customer, 
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

// 1. getOrdersList
export async function getOrdersList(filters?: any): Promise<OrderListResponse> {
  const response = await api.get("/sales/orders", { params: filters });
  return response.data;
}

// 2. getOrderById
export async function getOrderById(id: number): Promise<any> {
  const response = await api.get(`/sales/orders/${id}`);
  return response.data;
}

// 3. createSalesOrder
export async function createSalesOrder(payload: CreateOrderPayload): Promise<any> {
  const response = await api.post("/sales/orders/", payload);
  return response.data;
}

// 4. updateSalesOrder
export async function updateSalesOrder(id: number, payload: CreateOrderPayload): Promise<any> {
  const response = await api.put(`/sales/orders/${id}`, payload);
  return response.data;
}

// 5. searchCustomersByMobile
export async function searchCustomersByMobile(): Promise<Array<{ id: number; mobile_number: string }>> {
  const response = await api.get("/sales/orders/customers");
  return response.data;
}

// 6. getCustomerDetails
export async function getCustomerDetails(id: number): Promise<any> {
  const response = await api.get(`/sales/orders/customers/${id}`);
  return response.data;
}

// 7. getOrderDepartments
export async function getOrderDepartments(): Promise<ProjectDepartment[]> {
  const response = await api.get("/sales/orders/departments");
  return response.data;
}

// 8. getDeliveryTypes
export async function getDeliveryTypes(): Promise<DeliveryType[]> {
  const response = await api.get("/sales/orders/delivery-types");
  return response.data;
}

// 9. getSalesPriceCategories
export async function getSalesPriceCategories(): Promise<SalesPriceCategory[]> {
  const response = await api.get("/sales/products/price-categories");
  return response.data.data;
}

// 10. getProductPricesByCat
export async function getProductPricesByCat(priceCatId: number, categoryId: number): Promise<{ products: SalesProductPrice[] }> {
  const response = await api.get("/sales/orders/products/prices", {
    params: { price_category_id: priceCatId, category_id: categoryId }
  });
  return response.data;
}

// 11. getDeliveredOrders
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

// 12. closeSalesOrder
export async function closeSalesOrder(orderId: number): Promise<any> {
  const response = await api.patch(`/sales/orders/${orderId}/close`);
  return response.data;
}

// 13. getSalesAccounts
export async function getSalesAccounts(): Promise<any[]> {
  const response = await api.get("/sales/orders/accounts");
  return response.data;
}

// 🌟 14. GET Order Payment Details (/sales/orders/{id}/payment)
export async function getOrderPaymentDetails(orderId: number): Promise<any> {
  const response = await api.get(`/sales/orders/${orderId}/payment`);
  return response.data;
}

// 🌟 15. PUT Update Order Payment (/sales/orders/{id}/payment)
export async function updateOrderPayment(
  orderId: number,
  payload: { paid_amount: number; payment_status: string; account_id: number }
): Promise<any> {
  const response = await api.put(`/sales/orders/${orderId}/payment`, payload);
  return response.data;
}
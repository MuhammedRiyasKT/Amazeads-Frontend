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

// ഡിപ്പാർട്ട്മെന്റ് പേരുകളെ API URL സ്ലഗ്ഗുകളാക്കി മാറ്റുന്നു
export const getRoleSlug = (role: string): string => {
  return role.toLowerCase().trim().replace(/\s+/g, "-");
};

// 1. ഫിൽട്ടറുകൾ സ്വീകരിക്കുന്നതിനായി getOrdersList അപ്ഡേറ്റ് ചെയ്തു 🌟
export async function getOrdersList(filters?: any): Promise<OrderListResponse> {
  const response = await api.get("/sales/orders", { params: filters });
  return response.data;
}

// 2. സിംഗിൾ ഓർഡർ ഡീറ്റെയിൽസ് ഫെച്ച് ചെയ്യുന്നു
export async function getOrderById(id: number): Promise<any> {
  const response = await api.get(`/sales/orders/${id}`);
  return response.data;
}

// 3. ഓർഡർ ക്രിയേറ്റ് ചെയ്യുന്നു
export async function createSalesOrder(payload: CreateOrderPayload): Promise<any> {
  const response = await api.post("/sales/orders/", payload);
  return response.data;
}

// 4. ഓർഡർ അപ്ഡേറ്റ് ചെയ്യുന്നു
export async function updateSalesOrder(id: number, payload: CreateOrderPayload): Promise<any> {
  const response = await api.put(`/sales/orders/${id}`, payload);
  return response.data;
}

// 5. കസ്റ്റമർ മൊബൈൽ ഓട്ടോഫിൽ ഓർഡർ ലിസ്റ്റ്
export async function searchCustomersByMobile(): Promise<Array<{ id: number; mobile_number: string }>> {
  const response = await api.get("/sales/orders/customers");
  return response.data;
}

// 6. സിംഗിൾ കസ്റ്റമർ ഡീറ്റെയിൽസ് ഫെച്ച് ചെയ്യുന്നു
export async function getCustomerDetails(id: number): Promise<any> {
  const response = await api.get(`/sales/orders/customers/${id}`);
  return response.data;
}

// 7. പ്രൊജക്റ്റ് ഡിപ്പാർട്ട്മെന്റ് ലിസ്റ്റ്
export async function getOrderDepartments(): Promise<ProjectDepartment[]> {
  const response = await api.get("/sales/orders/departments");
  return response.data;
}

// 8. ഡെലിവറി ടൈപ്പ് ലിസ്റ്റ്
export async function getDeliveryTypes(): Promise<DeliveryType[]> {
  const response = await api.get("/sales/orders/delivery-types");
  return response.data;
}

// 9. പ്രൈസ് കാറ്റഗറി ലിസ്റ്റ്
export async function getSalesPriceCategories(): Promise<SalesPriceCategory[]> {
  const response = await api.get("/sales/products/price-categories");
  return response.data.data;
}

// 10. പ്രൊഡക്റ്റ് നെയിം & പ്രൈസ് ഓട്ടോഫിൽ സഗ്ഗഷൻസ് കാണാൻ
export async function getProductPricesByCat(priceCatId: number, categoryId: number): Promise<{ products: SalesProductPrice[] }> {
  const response = await api.get("/sales/orders/products/prices", {
    params: { price_category_id: priceCatId, category_id: categoryId }
  });
  return response.data;
}

// 11. GET Delivered Orders (/sales/orders?page=1&page_size=5&order_status=Delivered)
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

// 12. PATCH Close Sales Order (/sales/orders/[orderId]/close)
export async function closeSalesOrder(orderId: number): Promise<any> {
  const response = await api.patch(`/sales/orders/${orderId}/close`);
  return response.data;
}
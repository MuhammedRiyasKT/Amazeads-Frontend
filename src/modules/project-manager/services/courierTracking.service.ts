import api from "@/lib/axios";

// 1. GET Courier & Tracking Orders (/project-manager/courier-and-tracking)
export async function getCourierOrders(
  page: number = 1,
  pageSize: number = 5,
  status: string = "Packed",
  filters: any = {}
): Promise<any> {
  const params = {
    page,
    page_size: pageSize,
    order_status: status,
    ...filters,
  };
  const response = await api.get("/project-manager/courier-and-tracking", { params });
  return response.data;
}

// 🌟 2. GET In Transit Dedicated Endpoint (/project-manager/courier-and-tracking/in-transit)
export async function getInTransitOrders(
  page: number = 1,
  pageSize: number = 5,
  filters: any = {}
): Promise<any> {
  const params = {
    page,
    page_size: pageSize,
    ...filters,
  };
  const response = await api.get("/project-manager/courier-and-tracking/in-transit", { params });
  return response.data;
}

// 3. GET Delivery Types (/project-manager/courier-and-tracking/delivery-types)
export async function getDeliveryTypes(): Promise<any[]> {
  const response = await api.get("/project-manager/courier-and-tracking/delivery-types");
  return response.data;
}

// 4. Move Order To Transit (/project-manager/courier-and-tracking/orders/[orderId]/transit)
export async function moveOrderToTransit(orderId: number, payload: {
  tracking_id: string;
  expected_delivery_days: number;
  delivery_type_id: number;
  invoice_id?: string;
}): Promise<any> {
  const response = await api.patch(`/project-manager/courier-and-tracking/orders/${orderId}/transit`, payload);
  return response.data;
}

// 5. Mark Order Delivered (/project-manager/courier-and-tracking/orders/[orderId]/delivered)
export async function markOrderDelivered(orderId: number): Promise<any> {
  const response = await api.patch(`/project-manager/courier-and-tracking/orders/${orderId}/delivered`);
  return response.data;
}

// 6. Mark Order Delivered Directly From Packed (for Customer Pickup / Self Installation)
// POST /project-manager/courier-and-tracking/orders/{order_id}/delivered-from-packed
export async function markOrderDeliveredFromPacked(orderId: number, invoiceId: string): Promise<any> {
  const response = await api.patch(
    `/project-manager/courier-and-tracking/orders/${orderId}/delivered-from-packed`,
    { invoice_id: invoiceId }
  );
  return response.data;
}
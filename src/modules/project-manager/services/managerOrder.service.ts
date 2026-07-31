import api from "@/lib/axios";

// 1. പ്രോജക്റ്റ് മാനേജർ ഓർഡറുകൾ ഫെച്ച് ചെയ്യുന്നു
export async function getPMOrders(page: number = 1, pageSize: number = 5): Promise<any> {
  const response = await api.get("/project-manager/orders", {
    params: { page, page_size: pageSize }
  });
  return response.data;
}

// 2. പുതിയ ഓർഡർ നമ്പർ അസൈൻ ചെയ്യുന്നു
export async function assignOrderNumber(orderId: number, orderNumber: string): Promise<any> {
  const response = await api.patch(`/project-manager/orders/${orderId}/order-number`, {
    order_number: orderNumber
  });
  return response.data;
}

// 3. ഓർഡർ സ്പെസിഫിക്കേഷനുകൾ എടുക്കുന്നു
export async function getPMOrderById(orderId: number): Promise<any> {
  const response = await api.get(`/project-manager/orders/${orderId}`);
  return response.data;
}

// 4. പ്രൊജക്റ്റ് ഡിപ്പാർട്ട്മെന്റ് ലിസ്റ്റ് (പുതിയത് 🌟)
export async function getPMProjectDepartments(): Promise<any[]> {
  const response = await api.get("/project-manager/projects/departments");
  return response.data;
}

// 5. പ്രൊജക്റ്റ് സ്റ്റാഫ് ലിസ്റ്റ് (പുതിയത് 🌟)
export async function getPMProjectStaffs(roleId?: number): Promise<any[]> {
  const params: any = {};
  if (roleId) params.role_id = roleId;
  const response = await api.get("/project-manager/projects/staffs", { params });
  return response.data;
}

// 6. ടാസ്ക് അസൈൻ ചെയ്യുന്നു (പുതിയത് 🌟)
export async function assignProjectTask(payload: any): Promise<any> {
  const response = await api.post("/project-manager/projects/tasks", payload);
  return response.data;
}
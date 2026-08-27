import api from "@/lib/axios";

// ─── Shared Roles Typings ──────────────────────────────────────────────────────
export type UserRole = "admin" | "manager" | "project-manager";

// 1. പ്രോജക്റ്റ് മാനേജർ ഓർഡറുകൾ ഫെച്ച് ചെയ്യുന്നു (Ongoing Orders)
export async function getPMOrders(
  page: number = 1,
  pageSize: number = 5,
  orderStatus?: string,
  commitToDate?: string,
  completionDate?: string,
  role: UserRole = "project-manager"
): Promise<any> {
  const params: any = { page, page_size: pageSize, has_order_number: true };
  if (orderStatus) params.order_status = orderStatus;
  if (commitToDate) params.commit_to_date = commitToDate;
  if (completionDate) params.completion_date = completionDate;
  const response = await api.get(`/${role}/orders`, { params });
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
export async function getPMOrderById(orderId: number, role: UserRole = "project-manager"): Promise<any> {
  const response = await api.get(`/${role}/orders/${orderId}`);
  return response.data;
}

// 4. പ്രൊജക്റ്റ് ഡിപ്പാർട്ട്മെന്റ് ലിസ്റ്റ് (പുതിയത് 🌟)
export async function getPMProjectDepartments(): Promise<any[]> {
  const response = await api.get("/project-manager/projects/departments");
  return response.data;
}

// 5. പ്രൊജക്റ്റ് സ്റ്റാഫ് ലിസ്റ്റ് (പുതിയത് 🌟)
export async function getPMProjectStaffs(roleId?: number, role: UserRole = "project-manager"): Promise<any[]> {
  const params: any = {};
  if (roleId) params.role_id = roleId;
  const response = await api.get(`/${role}/projects/staffs`, { params });
  return response.data;
}

// 6. ടാസ്ക് അസൈൻ ചെയ്യുന്നു (പുതിയത് 🌟)
export async function assignProjectTask(payload: any): Promise<any> {
  const response = await api.post("/project-manager/projects/tasks", payload);
  return response.data;
}

// 7. സിംഗിൾ പ്രൊജക്റ്റിന്റെ മുഴുവൻ വിവരങ്ങളും ഫെച്ച് ചെയ്യുന്നു (/api/v1/project-manager/projects/[projectId])
export async function getPMProjectById(projectId: number, role: UserRole = "project-manager"): Promise<any> {
  const response = await api.get(`/${role}/projects/${projectId}`);
  return response.data;
}

// 8. PM Design ചെയ്യാനുള്ള പ്രൊജക്റ്റുകൾ ലിസ്റ്റ് ചെയ്യുന്നു 🌟
export async function getProjectsForDesignList(
  page: number = 1,
  pageSize: number = 5,
  designDate?: string,
  designTaskAssigned?: boolean,
  role: UserRole = "project-manager"
): Promise<any> {
  const params: any = { page, page_size: pageSize };
  if (designDate) {
    params.design_date = designDate;
  }
  if (designTaskAssigned !== undefined) {
    params.design_task_assigned = designTaskAssigned;
  }

  const response = await api.get(`/${role}/projects/projects-for-design`, { params });
  return response.data;
}

// 9. പ്രിന്റിംഗ് ചെയ്യാനുള്ള പ്രൊജക്റ്റുകൾ ഫെച്ച് ചെയ്യുന്നു (/project-manager/projects/projects-for-print)
export async function getProjectsForPrintList(
  page: number = 1,
  pageSize: number = 5,
  printingDate?: string,
  printingTaskAssigned?: boolean,
  role: UserRole = "project-manager"
): Promise<any> {
  const params: any = { page, page_size: pageSize };
  if (printingDate) {
    params.printing_date = printingDate;
  }
  if (printingTaskAssigned !== undefined) {
    params.printing_task_assigned = printingTaskAssigned;
  }

  const response = await api.get(`/${role}/projects/projects-for-print`, { params });
  return response.data;
}

// 10. പ്രിന്റിങ് സബ്-ഡിപ്പാർട്ട്മെന്റുകളുടെ ലിസ്റ്റ് എടുക്കുന്നു (/project-manager/projects/sub-departments/2)
export async function getPMSubDepartments(departmentId: number = 2): Promise<any[]> {
  const response = await api.get(`/project-manager/projects/sub-departments/${departmentId}`);
  return response.data;
}

// 11. പ്രിന്റിങ് ടാസ്ക് അസൈൻ ചെയ്യുന്നു (POST: /project-manager/projects/printing-tasks)
export async function assignPrintingTask(payload: any): Promise<any> {
  const response = await api.post("/project-manager/projects/printing-tasks", payload);
  return response.data;
}

// 12. പ്രൊഡക്ഷന് വേണ്ടിയുള്ള പ്രൊജക്റ്റുകൾ ലിസ്റ്റ് ചെയ്യുന്നു (/project-manager/projects/projects-for-production)
export async function getProjectsForProductionList(
  page: number = 1,
  pageSize: number = 5,
  taskAssigned?: boolean,
  role: UserRole = "project-manager"
): Promise<any> {
  const params: any = { page, page_size: pageSize };
  if (taskAssigned !== undefined) {
    params.production_task_assigned = taskAssigned;
  }
  const response = await api.get(`/${role}/projects/projects-for-production`, { params });
  return response.data;
}

// 13. പ്രൊഡക്ഷൻ ടാസ്ക് അസൈൻ ചെയ്യുന്നു (POST: /project-manager/projects/printing-tasks with department_id: 3)
export async function assignProductionTask(payload: any): Promise<any> {
  const response = await api.post("/project-manager/projects/printing-tasks", payload);
  return response.data;
}

// 14. PM Logistics List API (/project-manager/projects/projects-for-logistics)
export async function getProjectsForLogisticsList(
  page: number = 1,
  pageSize: number = 5,
  logisticsTaskAssigned?: boolean,
  tasksCompletedStatus?: boolean,
  role: UserRole = "project-manager"
): Promise<any> {
  const params: any = { page, page_size: pageSize };
  if (logisticsTaskAssigned !== undefined) {
    params.logistics_task_assigned = logisticsTaskAssigned;
  }
  if (tasksCompletedStatus !== undefined) {
    params.tasks_completed_status = tasksCompletedStatus;
  }
  const response = await api.get(`/${role}/projects/projects-for-logistics`, { params });
  return response.data;
}

// 15. PM Logistics Task Assign API (POST: /project-manager/projects/tasks with sub_department_id: 0)
export async function assignLogisticsTask(payload: any): Promise<any> {
  const response = await api.post("/project-manager/projects/tasks", payload);
  return response.data;
}

// 16. All Projects List with Filters (/project-manager/projects/all-project)
export async function getAllPMProjects(filters: any = {}, role: UserRole = "project-manager"): Promise<any> {
  const response = await api.get(`/${role}/projects/all-project`, {
    params: filters,
  });
  return response.data;
}

// 17. Project Department Progress Timeline (/project-manager/projects/[projectId]/status)
export async function getPMProjectStatusTimeline(projectId: number, role: UserRole = "project-manager"): Promise<any> {
  const response = await api.get(`/${role}/projects/${projectId}/status`);
  return response.data;
}

// 18. Multi-Department Task Assignment (POST: /project-manager/projects/tasks)
export async function assignGeneralProjectTask(payload: any): Promise<any> {
  const response = await api.post("/project-manager/projects/tasks", payload);
  return response.data;
}

// 19. Order Projects Department Assignment Status Fetch (/project-manager/orders/[orderId]/projects-assignments)
export async function getOrderProjectsAssignments(orderId: number, role: UserRole = "project-manager"): Promise<any[]> {
  const response = await api.get(`/${role}/orders/${orderId}/projects-assignments`);
  return response.data;
}

// 20. Update Project Department Assignments & Dates (PATCH: /project-manager/orders/projects/[projectId]/departments)
export async function updateProjectDepartmentAssignments(projectId: number, payload: any): Promise<any> {
  const response = await api.patch(`/project-manager/orders/projects/${projectId}/departments`, payload);
  return response.data;
}

// 21. PM Master Tasks List with Filters (/project-manager/tasks/)
export async function getPMTasksMasterList(
  page: number = 1,
  pageSize: number = 5,
  filters: any = {},
  role: UserRole = "project-manager"
): Promise<any> {
  const params: any = { page, page_size: pageSize, ...filters };
  const response = await api.get(`/${role}/tasks/`, { params });
  return response.data;
}

// 22. PM Task Specifications Details (/project-manager/tasks/[taskId]/project-details)
export async function getPMTaskDetailsById(taskId: number, role: UserRole = "project-manager"): Promise<any> {
  const response = await api.get(`/${role}/tasks/${taskId}/project-details`);
  return response.data;
}

// 1. പ്രോജക്റ്റ് മാനേജർ ഓർഡറുകൾ ഫെച്ച് ചെയ്യുന്നു (Has Order Number False)
export async function getPMNewOrders(page: number = 1, pageSize: number = 5, role: UserRole = "project-manager"): Promise<any> {
  const response = await api.get(`/${role}/orders`, {
    params: { page, page_size: pageSize, has_order_number: false, is_quotation: false }
  });
  return response.data;
}

// ─── Dashboard Stats APIs (New) ───────────────────────────────────────────────

export interface DashboardFilter {
  staff_id?: number;
  department_id?: number;
  sub_department_id?: number;
  month?: string;
  year?: number;
  day?: string;
  date?: string;
  from_date?: string;
  to_date?: string;
  upto_today?: boolean;
}

export async function getProjectManagerSalesKpiCards(filters: DashboardFilter = {}, role: UserRole = "project-manager"): Promise<any> {
  const response = await api.get(`/${role}/sales-kpi-cards`, { params: filters });
  return response.data;
}

export async function getProjectManagerOrderStatus(filters: DashboardFilter = {}, role: UserRole = "project-manager"): Promise<any> {
  const response = await api.get(`/${role}/sales-kpi-cards/order-status`, { params: filters });
  return response.data;
}

export async function getProjectManagerPaymentStatus(filters: DashboardFilter = {}, role: UserRole = "project-manager"): Promise<any> {
  const response = await api.get(`/${role}/sales-kpi-cards/payments`, { params: filters });
  return response.data;
}

export async function getProjectManagerTasksKpiCards(filters: DashboardFilter = {}, role: UserRole = "project-manager"): Promise<any> {
  const response = await api.get(`/${role}/tasks-kpi-cards`, { params: filters });
  return response.data;
}

export async function getProjectManagerStaffWiseTasks(filters: DashboardFilter = {}, role: UserRole = "project-manager"): Promise<any> {
  const response = await api.get(`/${role}/tasks-kpi-cards/staff-wise`, { params: filters });
  return response.data;
}

export async function getProjectManagerDesignTasks(filters: DashboardFilter = {}, role: UserRole = "project-manager"): Promise<any> {
  const response = await api.get(`/${role}/tasks-kpi-cards/design`, { params: filters });
  return response.data;
}

export async function getProjectManagerPrintingTasks(filters: DashboardFilter = {}, role: UserRole = "project-manager"): Promise<any> {
  const response = await api.get(`/${role}/tasks-kpi-cards/printing`, { params: filters });
  return response.data;
}

export async function getProjectManagerProductionTasks(filters: DashboardFilter = {}, role: UserRole = "project-manager"): Promise<any> {
  const response = await api.get(`/${role}/tasks-kpi-cards/production`, { params: filters });
  return response.data;
}

export async function getProjectManagerLogisticsTasks(filters: DashboardFilter = {}, role: UserRole = "project-manager"): Promise<any> {
  const response = await api.get(`/${role}/tasks-kpi-cards/logistics`, { params: filters });
  return response.data;
}

export async function getProjectManagerPrintingSubDepartmentTasks(filters: DashboardFilter = {}, role: UserRole = "project-manager"): Promise<any> {
  const response = await api.get(`/${role}/tasks-kpi-cards/printing/by-sub-department`, { params: filters });
  return response.data;
}

export async function getProjectManagerProductionSubDepartmentTasks(filters: DashboardFilter = {}, role: UserRole = "project-manager"): Promise<any> {
  const response = await api.get(`/${role}/tasks-kpi-cards/production/by-sub-department`, { params: filters });
  return response.data;
}

// 23. Update Project Design and Print Dates (PUT: /project-manager/projects/dates)
export async function updateProjectDates(
  projectId: number,
  payload: {
    design_date: string | null;
    printing_date: string | null;
    completion_date: null;
    completed_date: null;
  }
): Promise<any> {
  const response = await api.put(`/project-manager/projects/${projectId}/dates`, payload);
  return response.data;
}


import api from "@/lib/axios";

// 1. Logistics Tasks List (/api/v1/logistics/tasks/?page=1&page_size=5)
export async function getLogisticsTasks(page: number = 1, pageSize: number = 5): Promise<any> {
  const response = await api.get("/logistics/tasks/", {
    params: { page, page_size: pageSize },
  });
  return response.data;
}

// 2. Logistics Task Details (/api/v1/logistics/tasks/[taskId]/project-details)
export async function getLogisticsTaskDetails(taskId: number): Promise<any> {
  const response = await api.get(`/logistics/tasks/${taskId}/project-details`);
  return response.data;
}

// 3. Logistics Task Status Update (PATCH: /api/v1/logistics/tasks/[taskId]/status)
export async function updateLogisticsTaskStatus(taskId: number, status: string): Promise<any> {
  const response = await api.patch(`/logistics/tasks/${taskId}/status`, { status });
  return response.data;
}
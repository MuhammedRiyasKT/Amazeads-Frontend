import api from "@/lib/axios";

// 1. പ്രൊഡക്ഷൻ ടാസ്കുകൾ ഫെച്ച് ചെയ്യുന്നു (/api/v1/production/tasks/?sub_department_id=4&page=1&page_size=5)
export async function getProductionTasks(page: number = 1, pageSize: number = 5, subDeptId?: number): Promise<any> {
  const response = await api.get("/production/tasks/", {
    params: {
      page,
      page_size: pageSize,
      ...(subDeptId && { sub_department_id: subDeptId }),
    },
  });
  return response.data;
}

// 2. പ്രൊഡക്ഷൻ ടാസ്കിന്റെ വിവരങ്ങളും ഇമേജുകളും ഫെച്ച് ചെയ്യുന്നു (/api/v1/production/tasks/[taskId]/project-details)
export async function getProductionTaskDetails(taskId: number): Promise<any> {
  const response = await api.get(`/production/tasks/${taskId}/project-details`);
  return response.data;
}

// 3. പ്രൊഡക്ഷൻ ടാസ്ക് സ്റ്റാറ്റസ് അപ്ഡേറ്റ് ചെയ്യുന്നു (PATCH: /api/v1/production/tasks/[taskId]/status)
export async function updateProductionTaskStatus(taskId: number, status: string): Promise<any> {
  const response = await api.patch(`/production/tasks/${taskId}/status`, {
    status,
  });
  return response.data;
}

// 4. Status Timeline — All Projects (/api/v1/production/projects/all-project)
export async function getProductionAllProjects(filters: any = {}): Promise<any> {
  const response = await api.get("/production/projects/all-project", { params: filters });
  return response.data;
}

// 5. Get Single Project Details (/api/v1/designer/projects/{project_id})
export async function getProductionProjectDetails(projectId: number): Promise<any> {
  const response = await api.get(`/production/projects/${projectId}`);
  return response.data;
}

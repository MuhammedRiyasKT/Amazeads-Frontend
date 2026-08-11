import api from "@/lib/axios";

// 1. പ്രിന്റിങ് ടാസ്കുകൾ ഫെച്ച് ചെയ്യുന്നു (/api/v1/printing/tasks/)
export async function getPrintingTasks(page: number = 1, pageSize: number = 5, subDeptId?: number): Promise<any> {
  const response = await api.get("/printing/tasks/", {
    params: {
      page,
      page_size: pageSize,
      ...(subDeptId && { sub_department_id: subDeptId }),
    },
  });
  return response.data;
}

// 2. സിംഗിൾ പ്രിന്റിങ് ടാസ്കിന്റെ വിവരങ്ങൾ ഫെച്ച് ചെയ്യുന്നു (/api/v1/printing/tasks/[taskId]/project-details)
export async function getPrintingTaskDetails(taskId: number): Promise<any> {
  const response = await api.get(`/printing/tasks/${taskId}/project-details`);
  return response.data;
}

// 3. പ്രിന്റിങ് ടാസ്ക് സ്റ്റാറ്റസ് അപ്ഡേറ്റ് ചെയ്യുന്നു (PATCH: /api/v1/printing/tasks/[taskId]/status)
export async function updatePrintingTaskStatus(taskId: number, status: "In Progress" | "Completed" | "Not Completed"): Promise<any> {
  const response = await api.patch(`/printing/tasks/${taskId}/status`, {
    status,
  });
  return response.data;
}

// 4. Status Timeline — All Projects (/api/v1/printing/projects/all-project)
export async function getPrintingAllProjects(filters: any = {}): Promise<any> {
  const response = await api.get("/printing/projects/all-project", { params: filters });
  return response.data;
}

// 5. Get Single Project Details (/api/v1/designer/projects/{project_id})
export async function getPrintingProjectDetails(projectId: number): Promise<any> {
  const response = await api.get(`/printing/projects/${projectId}`);
  return response.data;
}
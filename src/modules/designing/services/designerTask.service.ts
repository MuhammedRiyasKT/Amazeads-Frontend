import api from "@/lib/axios";

// 1. ഡിസൈനർക്ക് അസൈൻ ചെയ്ത ടാസ്കുകൾ ലിസ്റ്റ് ചെയ്യുന്നു
// URL: [BASE_URL]/designer/tasks/
export async function getDesignerTasks(
  page: number = 1,
  pageSize: number = 5,
  filters: any = {}
): Promise<any> {
  const params: any = {
    page,
    page_size: pageSize,
    ...filters,
  };
  const response = await api.get("/designer/tasks/", { params });
  return response.data;
}

// 2. സിംഗിൾ ടാസ്കിന്റെ കൂടുതൽ പ്രൊജക്റ്റ് ഡീറ്റെയിൽസ് ഫെച്ച് ചെയ്യുന്നു (ഇമേജുകൾ അടക്കം)
// URL: [BASE_URL]/designer/tasks/[id]/project-details
export async function getDesignerProjectDetails(taskId: number): Promise<any> {
  const response = await api.get(`/designer/tasks/${taskId}/project-details`);
  return response.data;
}

// 3. ടാസ്ക് സ്റ്റാറ്റസ് അപ്ഡേറ്റ് ചെയ്യുന്നു (PATCH: /designer/tasks/[id]/status)
export async function updateDesignerTaskStatus(taskId: number, status: string): Promise<any> {
  const response = await api.patch(`/designer/tasks/${taskId}/status`, { status });
  return response.data;
}

// 4. Status Timeline — All Projects (/api/v1/designer/projects/all-project)
export async function getDesigningAllProjects(filters: any = {}): Promise<any> {
  const response = await api.get("/designer/projects/all-project", { params: filters });
  return response.data;
}

// 5. Get Single Project Details (/api/v1/designer/projects/{project_id})
export async function getDesigningProjectDetails(projectId: number): Promise<any> {
  const response = await api.get(`/designer/projects/${projectId}`);
  return response.data;
}
import api from "@/lib/axios";

// 1. കസ്റ്റമർ അപ്പ്രൂവൽ പെൻഡിങ് ഉള്ള പ്രൊജക്റ്റുകൾ ലിസ്റ്റ് ചെയ്യുന്നു
// URL: [BASE_URL]/sales/projects/customer-approval-pending
export async function getPendingDesignApprovals(): Promise<any[]> {
  const response = await api.get("/sales/projects/customer-approval-pending");
  return response.data;
}

// 2. സിംഗിൾ പ്രൊജക്റ്റിന്റെ കൂടുതൽ വിവരങ്ങൾ ഫെച്ച് ചെയ്യുന്നു (ഇമേജുകൾ അടക്കം)
// URL: [BASE_URL]/sales/projects/[task_id]/project-details
export async function getSalesProjectDetails(taskId: number): Promise<any> {
  const response = await api.get(`/sales/projects/${taskId}/project-details`);
  return response.data;
}

// 3. കസ്റ്റമർ ഡിസൈൻ അപ്പ്രൂവൽ സ്റ്റാറ്റസ് അപ്ഡേറ്റ് ചെയ്യുന്നു (PATCH: /sales/projects/[project_id]/customer-approval)
export async function submitCustomerApproval(projectId: number, approvedStatus: boolean): Promise<any> {
  const response = await api.patch(`/sales/projects/${projectId}/customer-approval`, {
    status: approvedStatus
  });
  return response.data;
}

// 4. ഡിസൈൻ ചെയ്യാനുള്ള പ്രൊജക്റ്റുകൾ ഫിൽട്ടർ സഹിതം ലിസ്റ്റ് ചെയ്യുന്നു (പുതിയത് 🌟)
export async function getProjectsToDesignList(page: number = 1, pageSize: number = 5): Promise<any> {
  const response = await api.get("/sales/projects/projects-to-design", {
    params: { page, page_size: pageSize }
  });
  return response.data;
}

// 5. സിംഗിൾ പ്രൊജക്റ്റ് വിവരങ്ങൾ ഫെച്ച് ചെയ്യുന്നു (പുതിയത് 🌟)
export async function getSalesProjectById(projectId: number): Promise<any> {
  const response = await api.get(`/sales/projects/${projectId}`);
  return response.data;
}

// 6. പ്രിന്റിംഗ് ചെയ്യാനുള്ള പ്രൊജക്റ്റുകൾ ലിസ്റ്റ് ചെയ്യുന്നു (Projects To Print 🌟)
export async function getProjectsToPrintList(page: number = 1, pageSize: number = 5): Promise<any> {
  const response = await api.get("/sales/projects/projects-for-print", {
    params: { page, page_size: pageSize }
  });
  return response.data;
}
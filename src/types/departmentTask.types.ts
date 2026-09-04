// src/types/departmentTask.types.ts

export interface DepartmentTask {
  id: number;
  assigned_by?: number | null;
  assigned_to?: number | null;
  assigned_on?: string | null;
  completion_time?: string | null;
  order_id?: number;
  project_id?: number | null;
  department_id?: number | null;
  sub_department_id?: number | null;
  task_description?: string | null;
  status?: string | null;
  updated_on?: string | null;
  updated_by?: number | null;
  completed_on?: string | null;
  assigned_by_name?: string | null;
  assigned_to_name?: string | null;
  department_name?: string | null;
  sub_department_name?: string | null;
  order_number?: string | null;
  order_status?: string | null;
  customer_id?: number | null;
  customer_name?: string | null;
  product_name?: string | null;
  category_id?: number | null;
  category_name?: string | null;
  designing_status?: string | null;
}

export interface DepartmentOrder {
  order_id: number;
  order_number?: string | null;
  order_status?: string | null;
  customer_id?: number | null;
  customer_name?: string | null;
  tasks?: DepartmentTask[];
}

export interface DepartmentTaskResponse {
  items: DepartmentOrder[];
  total?: number;
  page?: number;
  page_size?: number;
  total_pages?: number;
  pagination?: {
    total_count?: number;
    total_pages?: number;
  };
}

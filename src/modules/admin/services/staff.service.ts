// src/modules/admin/services/staff.service.ts

import api from "@/lib/axios";

export interface CreateStaffPayload {
  email: string;
  password?: string;
  staff_name: string;
  image_url: string;
  address: string;
  role_id: number;
}

export interface Staff {
  id: number;
  staff_name: string;
  email: string;
  image_url: string;
  address: string;
  role_name: string;
  account_status: boolean;
  created_on: string;
}

export interface Role {
  id: number;
  role_name: string;
  description: string;
}

// 1. Lists staff
export const getStaffs = async (): Promise<Staff[]> => {
  const response = await api.get("/admin/staffs");
  return response.data;
};

// 2. get single staff
export const getSingleStaff = async (id: number): Promise<Staff> => {
  const response = await api.get(`/admin/staffs/${id}`);
  const data = response.data;
  return Array.isArray(data) ? data[0] : data; 
};

// 2. Get Roles
export const getRoles = async (): Promise<Role[]> => {
  const response = await api.get("/admin/roles");
  return response.data;
};

// 3. create staff
export const createStaff = async (payload: CreateStaffPayload) => {
  const response = await api.post("/admin/staffs", payload);
  return response.data;
};

// 5. update staff
export const updateStaff = async (id: number, payload: Partial<CreateStaffPayload>) => {
  const response = await api.put(`/admin/staffs/${id}`, payload);
  return response.data;
};

// 4. delete staff
export const deleteStaff = async (id: number) => {
  const response = await api.delete(`/admin/staffs/${id}`);
  return response.data;
};

// 5. update status
export const updateStaffStatus = async (id: number, status: boolean) => {
  const response = await api.patch(`/admin/staffs/${id}/status`, {account_status: status});
  return response.data;
};
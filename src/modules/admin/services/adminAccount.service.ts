// src/modules/admin/services/adminAccount.service.ts

import api from "@/lib/axios";
import {
  AdminAccount,
  CreateAdminAccountPayload,
  UpdateAdminAccountPayload,
} from "../types/adminAccount.types";

export const getAdminAccounts = async (): Promise<AdminAccount[]> => {
  const response = await api.get<AdminAccount[]>("/admin/accounts");
  return response.data;
};

export const createAdminAccount = async (
  payload: CreateAdminAccountPayload
): Promise<AdminAccount> => {
  const response = await api.post<AdminAccount>("/admin/accounts", payload);
  return response.data;
};

export const updateAdminAccount = async (
  id: number,
  payload: UpdateAdminAccountPayload
): Promise<AdminAccount> => {
  const response = await api.put<AdminAccount>(`/admin/accounts/${id}`, payload);
  return response.data;
};

export const deleteAdminAccount = async (id: number): Promise<{ message?: string }> => {
  const response = await api.delete<{ message?: string }>(`/admin/accounts/${id}`);
  return response.data;
};

export const adminAccountService = {
  getAdminAccounts,
  createAdminAccount,
  updateAdminAccount,
  deleteAdminAccount,
};

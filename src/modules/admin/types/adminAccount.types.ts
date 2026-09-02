// src/modules/admin/types/adminAccount.types.ts

export interface AdminAccount {
  id: number;
  account_name: string;
  status: boolean;
  delete_status?: boolean;
  created_by_id?: number;
  created_on?: string;
  updated_on?: string;
}

export interface CreateAdminAccountPayload {
  account_name: string;
  status: boolean;
}

export interface UpdateAdminAccountPayload {
  account_name: string;
  status: boolean;
}

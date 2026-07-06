// src/constants/roles.ts

export const ROLES = {
  ADMIN: "admin",
  SALES: "sales",
  MANAGER: "manager",
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];
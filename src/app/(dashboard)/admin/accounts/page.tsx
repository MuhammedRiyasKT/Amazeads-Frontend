// src/app/(dashboard)/admin/accounts/page.tsx
"use client";

import React from "react";
import AccountsPage from "@/modules/accounts/pages/AccountsPage";

export default function AdminAccountsPageRoute() {
  return <AccountsPage role="admin" />;
}

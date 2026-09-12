// src/app/(dashboard)/manager/accounts/page.tsx
"use client";

import React from "react";
import AccountsPage from "@/modules/accounts/pages/AccountsPage";

export default function ManagerAccountsPageRoute() {
  return <AccountsPage role="manager" />;
}

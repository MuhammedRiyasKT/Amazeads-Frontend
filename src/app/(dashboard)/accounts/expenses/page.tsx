// src/app/(dashboard)/accounts/expenses/page.tsx

import React from "react";
import { AccountsExpensesPage } from "@/modules/accounts";

export const metadata = {
  title: "Expenses - Accounts - Amaze Ads ERP",
  description: "Track and manage business expenses for Amaze Ads.",
};

export default function Page() {
  return <AccountsExpensesPage />;
}

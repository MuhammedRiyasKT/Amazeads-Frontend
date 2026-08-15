// src/app/(dashboard)/project-manager/expenses/page.tsx

import React from "react";
import { ExpensesPage } from "@/modules/expenses";

export const metadata = {
  title: "Project Expenses - Amaze Ads ERP",
  description: "Track and manage project-related expenses, categorizations, and payment receipts.",
};

export default function Page() {
  return <ExpensesPage />;
}

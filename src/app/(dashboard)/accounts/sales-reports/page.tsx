// src/app/(dashboard)/accounts/sales-reports/page.tsx

import React from "react";
import { SalesReportsPage } from "@/modules/accounts";

export const metadata = {
  title: "Sales Reports - Accounts - Amaze Ads ERP",
  description: "View and manage daily sales collection reports.",
};

export default function Page() {
  return <SalesReportsPage />;
}

// src/app/(dashboard)/admin/payments/page.tsx
"use client";

import React from "react";
import PaymentsPage from "@/modules/sales/pages/PaymentsPage";

export default function AdminPaymentsPageRoute() {
  return <PaymentsPage role="admin" />;
}

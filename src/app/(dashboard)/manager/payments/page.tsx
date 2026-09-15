// src/app/(dashboard)/manager/payments/page.tsx
"use client";

import React from "react";
import PaymentsPage from "@/modules/sales/pages/PaymentsPage";

export default function ManagerPaymentsPageRoute() {
  return <PaymentsPage role="manager" />;
}

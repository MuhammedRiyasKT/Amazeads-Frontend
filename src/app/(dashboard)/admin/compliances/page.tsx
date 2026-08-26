// src/app/(dashboard)/admin/compliances/page.tsx
"use client";

import React from "react";
import CompliancesPage from "@/modules/compliances/components/CompliancesPage";

export default function AdminCompliancesPageRoute() {
    return <CompliancesPage role="admin" />;
}

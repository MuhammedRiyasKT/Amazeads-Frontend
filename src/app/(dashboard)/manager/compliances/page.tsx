// src/app/(dashboard)/manager/compliances/page.tsx
"use client";

import React from "react";
import CompliancesPage from "@/modules/compliances/components/CompliancesPage";

export default function ManagerCompliancesPageRoute() {
    return <CompliancesPage role="manager" />;
}

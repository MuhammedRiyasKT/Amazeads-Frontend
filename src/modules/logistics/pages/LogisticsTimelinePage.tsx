// src/modules/logistics/pages/LogisticsTimelinePage.tsx
"use client";

import DeptStatusTimelinePage from "@/modules/shared/DeptStatusTimelinePage";
import { getLogisticsAllProjects, getLogisticsProjectDetails } from "../services/logisticsTask.service";

export default function LogisticsTimelinePage() {
  return (
    <DeptStatusTimelinePage
      department="logistics"
      title="Logistics — Status Timeline"
      subtitle="View all projects scheduled for the logistics department. Track progress and plan ahead."
      fetchFn={getLogisticsAllProjects}
      detailFetchFn={getLogisticsProjectDetails}
    />
  );
}

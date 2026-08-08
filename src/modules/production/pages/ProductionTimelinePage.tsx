// src/modules/production/pages/ProductionTimelinePage.tsx
"use client";

import DeptStatusTimelinePage from "@/modules/shared/DeptStatusTimelinePage";
import { getProductionAllProjects } from "../services/productionTask.service";

export default function ProductionTimelinePage() {
  return (
    <DeptStatusTimelinePage
      department="production"
      title="Production — Status Timeline"
      subtitle="View all projects scheduled for the production department. Track progress and plan ahead."
      fetchFn={getProductionAllProjects}
    />
  );
}

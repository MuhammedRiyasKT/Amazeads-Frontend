// src/modules/printing/pages/PrintingTimelinePage.tsx
"use client";

import DeptStatusTimelinePage from "@/modules/shared/DeptStatusTimelinePage";
import { getPrintingAllProjects } from "../services/printingTask.service";

export default function PrintingTimelinePage() {
  return (
    <DeptStatusTimelinePage
      department="printing"
      title="Printing — Status Timeline"
      subtitle="View all projects scheduled for the printing department. Track progress and plan ahead."
      fetchFn={getPrintingAllProjects}
    />
  );
}

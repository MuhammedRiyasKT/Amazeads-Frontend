// src/modules/designing/pages/DesigningTimelinePage.tsx
"use client";

import DeptStatusTimelinePage from "@/modules/shared/DeptStatusTimelinePage";
import { getDesigningAllProjects } from "../services/designerTask.service";

export default function DesigningTimelinePage() {
  return (
    <DeptStatusTimelinePage
      department="designing"
      title="Designing — Status Timeline"
      subtitle="View all projects scheduled for the designing department. Track progress and plan ahead."
      fetchFn={getDesigningAllProjects}
    />
  );
}

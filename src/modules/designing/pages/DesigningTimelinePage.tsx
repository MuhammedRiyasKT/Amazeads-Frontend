"use client";

import DeptStatusTimelinePage from "@/modules/shared/DeptStatusTimelinePage";
import {
  getDesigningAllProjects,
  getDesigningProjectDetails,
} from "../services/designerTask.service";

export default function DesigningTimelinePage() {
  return (
    <DeptStatusTimelinePage
      department="designing"
      title="Designing — Upcoming Projects"
      subtitle="View projects planned for the designing department and prepare upcoming work in advance."
      fetchFn={getDesigningAllProjects}
      detailFetchFn={getDesigningProjectDetails}
    />
  );
}
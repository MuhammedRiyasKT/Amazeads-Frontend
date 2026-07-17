// src/app/(dashboard)/admin/daily-tasks/staff/[id]/page.tsx

import { StaffAssignmentsOverviewPage } from "@/modules/admin";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <StaffAssignmentsOverviewPage staffId={parseInt(id)} />;
}
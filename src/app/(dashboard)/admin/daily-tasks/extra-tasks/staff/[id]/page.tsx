// src/app/(dashboard)/admin/daily-tasks/extra-tasks/staff/[id]/page.tsx

import { ExtraStaffTasksOverviewPage } from "@/modules/admin";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <ExtraStaffTasksOverviewPage staffId={parseInt(id)} />;
}
import PrintingOverviewDashboard from "@/modules/printing/components/PrintingOverviewDashboard";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function CategoryOverviewPage({ params }: Props) {
    const { id } = await params;
    const subDeptId = Number(id);

    return <PrintingOverviewDashboard subDeptId={subDeptId} />;
}

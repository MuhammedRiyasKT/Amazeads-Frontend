type Props = {
  params: Promise<{ id: string }>;
};

export default async function HRDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <div>
      <h1 className="text-2xl font-bold">HR Detail</h1>
      <p>ID: {id}</p>
    </div>
  );
}

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AccountsDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <div>
      <h1 className="text-2xl font-bold">Accounts Detail</h1>
      <p>ID: {id}</p>
    </div>
  );
}

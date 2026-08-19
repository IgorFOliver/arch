import { EditUserPage } from '@/features/users';

export default async function EditUser({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <EditUserPage userId={id} />;
}

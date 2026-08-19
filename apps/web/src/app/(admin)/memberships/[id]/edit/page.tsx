import { EditMembershipPage } from '@/features/memberships';

export default async function EditMembership({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <EditMembershipPage membershipId={id} />;
}

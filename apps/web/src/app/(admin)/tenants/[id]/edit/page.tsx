import { EditTenantPage } from '@/features/tenants';

export default async function EditTenant({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <EditTenantPage tenantId={id} />;
}

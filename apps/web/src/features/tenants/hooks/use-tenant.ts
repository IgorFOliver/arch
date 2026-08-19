import { useQuery } from '@tanstack/react-query';
import { getTenant } from '@/features/tenants/tenants-api';
import { tenantsKeys } from '@/features/tenants/query-keys';

export function useTenant(id: string) {
  return useQuery({
    queryKey: tenantsKeys.detail(id),
    queryFn: () => getTenant(id),
  });
}

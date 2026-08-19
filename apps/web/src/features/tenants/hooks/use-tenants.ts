import { useQuery } from '@tanstack/react-query';
import { listTenants } from '@/features/tenants/tenants-api';
import { tenantsKeys } from '@/features/tenants/query-keys';
import type { ListTenantsParams } from '@/features/tenants/tenants-api.types';

export function useTenants(params: ListTenantsParams) {
  return useQuery({
    queryKey: tenantsKeys.list(params),
    queryFn: () => listTenants(params),
    placeholderData: (previousData) => previousData,
  });
}

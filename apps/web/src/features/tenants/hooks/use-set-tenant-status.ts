import { useMutation, useQueryClient } from '@tanstack/react-query';
import { activateTenant, suspendTenant } from '@/features/tenants/tenants-api';
import { tenantsKeys } from '@/features/tenants/query-keys';
import type { ListTenantsResponse } from '@/features/tenants/tenants-api.types';
import type { TenantStatus } from '@/features/tenants/domain/tenant';

interface SetTenantStatusVariables {
  id: string;
  status: TenantStatus;
}

export function useSetTenantStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: SetTenantStatusVariables) =>
      status === 'ACTIVE' ? activateTenant(id) : suspendTenant(id),
    onMutate: async ({ id, status }: SetTenantStatusVariables) => {
      await queryClient.cancelQueries({ queryKey: tenantsKeys.lists() });

      const previousLists = queryClient.getQueriesData<ListTenantsResponse>({
        queryKey: tenantsKeys.lists(),
      });

      queryClient.setQueriesData<ListTenantsResponse>(
        { queryKey: tenantsKeys.lists() },
        (data) =>
          data && {
            ...data,
            tenants: data.tenants.map((tenant) =>
              tenant.id === id ? { ...tenant, status } : tenant,
            ),
          },
      );

      return { previousLists };
    },
    onError: (_error, _variables, context) => {
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSuccess: (tenant) => {
      queryClient.setQueryData(tenantsKeys.detail(tenant.id), tenant);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tenantsKeys.lists() });
    },
  });
}

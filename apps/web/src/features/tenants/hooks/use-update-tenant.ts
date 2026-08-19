import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTenant } from '@/features/tenants/tenants-api';
import { tenantsKeys } from '@/features/tenants/query-keys';

interface UpdateTenantVariables {
  id: string;
  input: { name?: string };
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: UpdateTenantVariables) =>
      updateTenant(id, input),
    onSuccess: (tenant) => {
      queryClient.setQueryData(tenantsKeys.detail(tenant.id), tenant);
      queryClient.invalidateQueries({ queryKey: tenantsKeys.lists() });
    },
  });
}

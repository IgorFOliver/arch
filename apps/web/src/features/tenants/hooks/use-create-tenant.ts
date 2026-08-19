import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTenant } from '@/features/tenants/tenants-api';
import { tenantsKeys } from '@/features/tenants/query-keys';

export function useCreateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantsKeys.all() });
    },
  });
}

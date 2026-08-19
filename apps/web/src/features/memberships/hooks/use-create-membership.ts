import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createMembership } from '@/features/memberships/memberships-api';
import { membershipsKeys } from '@/features/memberships/query-keys';

export function useCreateMembership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMembership,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membershipsKeys.all() });
    },
  });
}

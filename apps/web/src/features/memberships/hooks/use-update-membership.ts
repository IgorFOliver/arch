import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateMembershipInput } from '@/features/memberships/memberships-api.types';
import { updateMembership } from '@/features/memberships/memberships-api';
import { membershipsKeys } from '@/features/memberships/query-keys';

interface UpdateMembershipVariables {
  id: string;
  input: UpdateMembershipInput;
}

export function useUpdateMembership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: UpdateMembershipVariables) =>
      updateMembership(id, input),
    onSuccess: () => {
      // Not setQueryData here: the mutation response is the bare
      // Membership (no userEmail/userName), which would poison the
      // detail cache with an incomplete entry — invalidating forces the
      // next read to refetch the enriched view instead.
      queryClient.invalidateQueries({ queryKey: membershipsKeys.all() });
    },
  });
}

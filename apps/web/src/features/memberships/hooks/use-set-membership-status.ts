import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  reactivateMembership,
  revokeMembership,
} from '@/features/memberships/memberships-api';
import { membershipsKeys } from '@/features/memberships/query-keys';
import type { ListMembershipsResponse } from '@/features/memberships/memberships-api.types';
import type { MembershipStatus } from '@/features/memberships/domain/membership';

interface SetMembershipStatusVariables {
  id: string;
  status: MembershipStatus;
}

export function useSetMembershipStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: SetMembershipStatusVariables) =>
      status === 'ACTIVE' ? reactivateMembership(id) : revokeMembership(id),
    onMutate: async ({ id, status }: SetMembershipStatusVariables) => {
      await queryClient.cancelQueries({ queryKey: membershipsKeys.lists() });

      const previousLists = queryClient.getQueriesData<ListMembershipsResponse>(
        {
          queryKey: membershipsKeys.lists(),
        },
      );

      queryClient.setQueriesData<ListMembershipsResponse>(
        { queryKey: membershipsKeys.lists() },
        (data) =>
          data && {
            ...data,
            memberships: data.memberships.map((membership) =>
              membership.id === id ? { ...membership, status } : membership,
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
    // Not setQueryData(detail(id), ...) here: the mutation response is the
    // bare Membership (no userEmail/userName) — onSettled's invalidation
    // is what keeps the detail cache correctly enriched.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: membershipsKeys.all() });
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteUserMembership } from '@/features/users/users-api';
import { usersKeys } from '@/features/users/query-keys';

interface DeleteUserMembershipVariables {
  userId: string;
  membershipId: string;
}

export function useDeleteUserMembership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, membershipId }: DeleteUserMembershipVariables) =>
      deleteUserMembership(userId, membershipId),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: usersKeys.memberships(userId),
      });
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addUserMembership } from '@/features/users/users-api';
import type { AddMembershipInput } from '@/features/users/users-api.types';
import { usersKeys } from '@/features/users/query-keys';

interface AddUserMembershipVariables {
  userId: string;
  input: AddMembershipInput;
}

export function useAddUserMembership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, input }: AddUserMembershipVariables) =>
      addUserMembership(userId, input),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: usersKeys.memberships(userId),
      });
    },
  });
}

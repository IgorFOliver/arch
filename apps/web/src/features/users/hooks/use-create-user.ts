import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUser } from '@/features/users/users-api';
import { usersKeys } from '@/features/users/query-keys';

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all() });
    },
  });
}

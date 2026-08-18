import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUser } from './../users-api';
import type { UpdateUserInput } from './../users-api.types';

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) =>
      updateUser(id, input),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.setQueryData(['users', user.id], user);
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUser } from '@/features/users/users-api';
import type {
  ListUsersResponse,
  UpdateUserInput,
} from '@/features/users/users-api.types';
import { usersKeys } from '@/features/users/query-keys';

interface UpdateUserVariables {
  id: string;
  input: UpdateUserInput;
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: UpdateUserVariables) => updateUser(id, input),
    onMutate: async ({ id, input }: UpdateUserVariables) => {
      await queryClient.cancelQueries({ queryKey: usersKeys.lists() });

      const previousLists = queryClient.getQueriesData<ListUsersResponse>({
        queryKey: usersKeys.lists(),
      });

      queryClient.setQueriesData<ListUsersResponse>(
        { queryKey: usersKeys.lists() },
        (data) =>
          data && {
            ...data,
            users: data.users.map((user) =>
              user.id === id ? { ...user, ...input } : user,
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
    onSuccess: (user) => {
      queryClient.setQueryData(usersKeys.detail(user.id), user);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
}

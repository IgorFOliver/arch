import { useQuery } from '@tanstack/react-query';
import { listUsers } from '@/features/users/users-api';
import { usersKeys } from '@/features/users/query-keys';
import type { ListUsersParams } from '@/features/users/users-api.types';

export function useUsers(params: ListUsersParams) {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => listUsers(params),
    placeholderData: (previousData) => previousData,
  });
}

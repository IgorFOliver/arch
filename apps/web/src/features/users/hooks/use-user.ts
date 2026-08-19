import { useQuery } from '@tanstack/react-query';
import { getUser } from '@/features/users/users-api';
import { usersKeys } from '@/features/users/query-keys';

export function useUser(id: string) {
  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: () => getUser(id),
  });
}

import { useQuery } from '@tanstack/react-query';
import { listUserMemberships } from '@/features/users/users-api';
import { usersKeys } from '@/features/users/query-keys';

export function useUserMemberships(userId: string) {
  return useQuery({
    queryKey: usersKeys.memberships(userId),
    queryFn: () => listUserMemberships(userId),
  });
}

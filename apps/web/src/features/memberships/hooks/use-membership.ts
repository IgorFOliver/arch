import { useQuery } from '@tanstack/react-query';
import { getMembership } from '@/features/memberships/memberships-api';
import { membershipsKeys } from '@/features/memberships/query-keys';

export function useMembership(id: string) {
  return useQuery({
    queryKey: membershipsKeys.detail(id),
    queryFn: () => getMembership(id),
  });
}

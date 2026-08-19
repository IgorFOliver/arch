import { useQuery } from '@tanstack/react-query';
import { listMemberships } from '@/features/memberships/memberships-api';
import { membershipsKeys } from '@/features/memberships/query-keys';

export function useMemberships() {
  return useQuery({
    queryKey: membershipsKeys.lists(),
    queryFn: listMemberships,
  });
}

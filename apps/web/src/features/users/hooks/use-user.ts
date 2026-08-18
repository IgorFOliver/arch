import { useQuery } from '@tanstack/react-query';
import { getUser } from './../users-api';

export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => getUser(id),
  });
}

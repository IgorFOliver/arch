import { useQuery } from '@tanstack/react-query';
import { listUsers } from './../users-api';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: listUsers,
  });
}

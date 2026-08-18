import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { AuthApiError, getSession } from './api';
import { useAuthStore } from './store';

export function useSession() {
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);
  const setBlocked = useAuthStore((state) => state.setBlocked);

  const query = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: getSession,
    retry: false,
  });

  useEffect(() => {
    if (query.data) {
      setUser(query.data.user);
      return;
    }

    if (query.isSuccess) {
      clearUser();
      return;
    }

    if (query.isError) {
      if (
        query.error instanceof AuthApiError &&
        query.error.code === 'accountInactive'
      ) {
        setBlocked();
      } else {
        clearUser();
      }
    }
  }, [
    query.data,
    query.isSuccess,
    query.isError,
    query.error,
    setUser,
    clearUser,
    setBlocked,
  ]);

  return query;
}

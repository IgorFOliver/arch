import { useQuery } from '@tanstack/react-query';

import { authKeys } from './query-keys';
import { AuthApiError, getSession } from './api';
import type { AuthUser } from './types';

export interface UseAuthResult {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBlocked: boolean;
}

export function useAuth(): UseAuthResult {
  const query = useQuery({
    queryKey: authKeys.session(),
    queryFn: getSession,
    retry: false,
  });

  const user = query.data?.user ?? null;
  const isBlocked =
    query.isError &&
    query.error instanceof AuthApiError &&
    query.error.code === 'accountInactive';

  return {
    user,
    isAuthenticated: Boolean(user),
    isLoading: query.isLoading,
    isBlocked,
  };
}

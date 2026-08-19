'use client';

import { ReactNode, createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';

import { authKeys } from '@/features/auth/query-keys';
import { AuthApiError, getSession } from '@/features/auth/api';
import type { AuthUser } from '@/features/auth/types';

export interface SessionContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBlocked: boolean;
  /** Re-hydrates from the server — only needed for state the backend
   *  changes outside of this app's own mutations (rare; login/logout and
   *  a future tenant switch already write straight into the cache via
   *  setQueryData, with no need to refetch). */
  refetch: () => void;
}

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined,
);

/**
 * The single place `/auth/session` is fetched. Every consumer reads from
 * this Context via `useSession()` instead of calling its own `useQuery` —
 * one request, hydrated once per app load, not once per page.
 *
 * `staleTime: Infinity` is deliberate: session data only ever changes
 * through this app's own login/logout mutations, both of which write the
 * new value straight into this query's cache entry (see useLogin/
 * useLogout) — there's nothing to poll for, so nothing should ever make
 * this "go stale" just because a page was opened or the window refocused.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const query = useQuery({
    queryKey: authKeys.session(),
    queryFn: getSession,
    retry: false,
    staleTime: Infinity,
  });

  const user = query.data?.user ?? null;
  const isBlocked =
    query.isError &&
    query.error instanceof AuthApiError &&
    query.error.code === 'accountInactive';

  const value: SessionContextValue = {
    user,
    isAuthenticated: Boolean(user),
    isLoading: query.isLoading,
    isBlocked,
    refetch: () => {
      void query.refetch();
    },
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

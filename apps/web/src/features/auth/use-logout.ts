import { useMutation, useQueryClient } from '@tanstack/react-query';

import { logout } from './api';
import { authKeys } from './query-keys';

export function useLogout() {
  const queryClient = useQueryClient();

  const clearSession = () => {
    queryClient.setQueryData(authKeys.session(), null);
  };

  return useMutation({
    mutationFn: logout,
    onSuccess: clearSession,
    onError: clearSession,
  });
}

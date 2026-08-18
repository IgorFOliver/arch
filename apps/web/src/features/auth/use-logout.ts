import { useMutation } from '@tanstack/react-query';

import { logout } from './api';
import { useAuthStore } from './store';

export function useLogout() {
  const clearUser = useAuthStore((state) => state.clearUser);

  return useMutation({
    mutationFn: logout,
    onSuccess: () => clearUser(),
    onError: () => clearUser(),
  });
}

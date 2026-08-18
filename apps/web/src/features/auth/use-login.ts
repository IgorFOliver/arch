import { useMutation } from '@tanstack/react-query';

import { login } from './api';
import { useAuthStore } from './store';

export function useLogin() {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => setUser(data.user),
  });
}

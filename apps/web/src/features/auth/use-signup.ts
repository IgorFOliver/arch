import { useMutation } from '@tanstack/react-query';

import { signup } from './api';
import { useAuthStore } from './store';

export function useSignup() {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: signup,
    onSuccess: (data) => setUser(data.user),
  });
}

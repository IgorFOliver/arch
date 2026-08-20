import { useMutation } from '@tanstack/react-query';

import { forgotPassword } from './api';

// No session-cache interaction, unlike useLogin/useSignup — requesting a
// reset link never authenticates anyone.
export function useForgotPassword() {
  return useMutation({
    mutationFn: forgotPassword,
  });
}

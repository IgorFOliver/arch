import { useMutation } from '@tanstack/react-query';

import { resetPassword } from './api';

interface ResetPasswordVariables {
  token: string;
  password: string;
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, password }: ResetPasswordVariables) =>
      resetPassword(token, password),
  });
}

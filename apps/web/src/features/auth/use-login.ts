import { useMutation, useQueryClient } from '@tanstack/react-query';

import { login } from './api';
import { authKeys } from './query-keys';

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.session(), data);
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { signup } from './api';
import { authKeys } from './query-keys';

export function useSignup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.session(), data);
    },
  });
}

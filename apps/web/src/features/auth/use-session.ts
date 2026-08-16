import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { getSession } from "./api";
import { useAuthStore } from "./store";

export function useSession() {
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  const query = useQuery({
    queryKey: ["auth", "session"],
    queryFn: getSession,
    retry: false,
  });

  useEffect(() => {
    if (query.data) {
      setUser(query.data.user);
    } else if (query.isSuccess) {
      clearUser();
    }
  }, [query.data, query.isSuccess, setUser, clearUser]);

  return query;
}

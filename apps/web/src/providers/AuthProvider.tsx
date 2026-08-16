"use client";

import { ReactNode } from "react";

import { useSession } from "@/features/auth/use-session";

export function AuthProvider({ children }: { children: ReactNode }) {
  useSession();

  return <>{children}</>;
}

'use client';

import { ReactNode } from 'react';

import { useAuth } from '@/features/auth/use-auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  useAuth();

  return <>{children}</>;
}

import type { Role } from '@4basearch/domain-types';

export interface User {
  id: string;
  email: string;
  passwordHash: string | null;
  name: string | null;
  company: string | null;
  role: Role;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type AuthProviderType = 'LOCAL' | 'AUTH0';

import type { Role } from '@4basearch/domain-types';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
}

import type { Role } from '@4basearch/domain-types';
import type { User } from '../../domain/entities/user.entity';

export interface PublicUser {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  role: Role;
  active: boolean;
  createdAt: Date;
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    company: user.company,
    role: user.role,
    active: user.active,
    createdAt: user.createdAt,
  };
}

import type { Role } from '@4basearch/domain-types';
import type { User } from '../../domain/entities/user.entity';
import type { TenantScopedUser } from '../../domain/repositories/user.repository';

export interface PublicUser {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  /** From the current tenant's Membership — null when no tenant could be
   *  resolved for this response (e.g. AUTHENTICATED-only endpoints). */
  role: Role | null;
  active: boolean;
  createdAt: Date;
}

/**
 * `role` is never read off `User` (it doesn't have one) — callers pass it
 * explicitly, sourced from whichever Membership is relevant to the
 * response being built.
 */
export function toPublicUser(user: User, role: Role | null): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    company: user.company,
    role,
    active: user.active,
    createdAt: user.createdAt,
  };
}

export function toPublicUserFromTenantScoped(
  user: TenantScopedUser,
): PublicUser {
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

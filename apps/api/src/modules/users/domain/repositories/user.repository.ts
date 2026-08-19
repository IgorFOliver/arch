import type { Role } from '@4basearch/domain-types';
import type { AuthProviderType, User } from '../entities/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface CreateUserData {
  email: string;
  passwordHash: string | null;
  name?: string | null;
  company?: string | null;
}

export interface UpdateUserData {
  name?: string;
  company?: string;
}

/**
 * A user as seen from inside one tenant — `role`/`active` are read
 * entirely from that tenant's Membership, never from the User row itself.
 */
export interface TenantScopedUser {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  role: Role;
  active: boolean;
  createdAt: Date;
}

export interface ListTenantMembersFilter {
  tenantId: string;
  page: number;
  pageSize: number;
  search?: string;
  role?: Role;
  /** undefined = both active and revoked memberships (an admin must still
   *  be able to see and re-activate a blocked member). */
  active?: boolean;
  sortBy: 'createdAt' | 'name' | 'email';
  sortDir: 'asc' | 'desc';
}

export interface UserRepository {
  // Identity operations — deliberately NOT tenant-scoped. Login/signup/
  // session validation must resolve a user before any tenant is known.
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;

  // Tenant-scoped admin operations — "user pertence ao Tenant" is always
  // defined via Membership, never a User.tenantId (which doesn't exist).
  // `updateMember` is the only mutation on User's profile fields anywhere
  // in the codebase — there is deliberately no bare `update(id, data)`,
  // so it's structurally impossible to touch a user's profile without
  // also proving they belong to the given tenant.
  findMemberById(
    tenantId: string,
    userId: string,
  ): Promise<TenantScopedUser | null>;
  findMembers(
    filter: ListTenantMembersFilter,
  ): Promise<{ users: TenantScopedUser[]; total: number }>;
  updateMember(
    tenantId: string,
    userId: string,
    data: UpdateUserData,
  ): Promise<User>;

  /** Identity-linking primitives backing the Auth0 find-or-create flow. */
  findIdentity(
    provider: AuthProviderType,
    providerId: string,
  ): Promise<{ userId: string; user: User } | null>;
  linkIdentity(
    userId: string,
    provider: AuthProviderType,
    providerId: string,
  ): Promise<void>;
  createFromAuth0(
    email: string,
    provider: AuthProviderType,
    providerId: string,
  ): Promise<User>;
}

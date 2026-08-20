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
  /** Platform-wide ban flag — see User.active. */
  active?: boolean;
}

export interface ListUsersFilter {
  page: number;
  pageSize: number;
  search?: string;
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

  // Platform Scope: the platform-wide identity registry — every User on
  // the platform, independent of any tenant/Membership.
  findAll(filter: ListUsersFilter): Promise<{ users: User[]; total: number }>;
  update(id: string, data: UpdateUserData): Promise<User>;
  /** Narrow, purpose-built mutation (like linkIdentity/createFromAuth0)
   *  rather than folding `passwordHash` into UpdateUserData — a password
   *  change is a distinct, security-sensitive operation (see
   *  ResetPasswordUseCase), not a generic profile edit. */
  updatePassword(id: string, passwordHash: string): Promise<void>;

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

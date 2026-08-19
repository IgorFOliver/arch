import type { Role } from '@4basearch/domain-types';
import type { AuthProviderType, User } from '../entities/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface ListUsersFilter {
  page: number;
  pageSize: number;
  search?: string;
  role?: Role;
  active?: boolean;
  sortBy: 'createdAt' | 'name' | 'email';
  sortDir: 'asc' | 'desc';
}

export interface CreateUserData {
  email: string;
  passwordHash: string | null;
  name?: string | null;
  company?: string | null;
  role?: Role;
}

export interface UpdateUserData {
  name?: string;
  company?: string;
  role?: Role;
  active?: boolean;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(filter: ListUsersFilter): Promise<{ users: User[]; total: number }>;
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User>;

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

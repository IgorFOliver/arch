import { z } from 'zod';
import { managedUserSchema } from './domain/user';
import type { Role } from '@4basearch/domain-types';

export interface CreateUserInput {
  name: string;
  company?: string | null;
  email: string;
  password: string;
  role: Role;
}

export interface UpdateUserInput {
  name?: string;
  company?: string | null;
  role?: Role;
  active?: boolean;
}

export type UsersErrorCode =
  | 'loadUsersFailed'
  | 'userNotFound'
  | 'emailTaken'
  | 'createUserFailed'
  | 'updateUserFailed';

export type UsersSortField = 'createdAt' | 'name' | 'email';
export type SortDirection = 'asc' | 'desc';

export interface ListUsersParams {
  page: number;
  pageSize: number;
  search?: string;
  role?: Role;
  active?: boolean;
  sortBy?: UsersSortField;
  sortDir?: SortDirection;
}

const listUsersMetaSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export const listUsersResponseSchema = z.object({
  users: z.array(managedUserSchema),
  meta: listUsersMetaSchema,
});

export const userResponseSchema = z.object({
  user: managedUserSchema,
});

export type ListUsersResponse = z.infer<typeof listUsersResponseSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;

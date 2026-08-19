import { z } from 'zod';
import { managedUserSchema } from './domain/user';
import { userMembershipSchema } from './domain/user-membership';
import type { Role } from '@4basearch/domain-types';

export interface CreateUserInput {
  name: string;
  company?: string | null;
  email: string;
  password: string;
}

export interface UpdateUserInput {
  name?: string;
  company?: string | null;
  active?: boolean;
}

export interface AddMembershipInput {
  tenantId: string;
  role: Role;
}

export type UsersErrorCode =
  | 'loadUsersFailed'
  | 'userNotFound'
  | 'emailTaken'
  | 'createUserFailed'
  | 'updateUserFailed'
  | 'loadMembershipsFailed'
  | 'addMembershipFailed'
  | 'membershipAlreadyExists'
  | 'deleteMembershipFailed';

export type UsersSortField = 'createdAt' | 'name' | 'email';
export type SortDirection = 'asc' | 'desc';

export interface ListUsersParams {
  page: number;
  pageSize: number;
  search?: string;
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

export const listUserMembershipsResponseSchema = z.object({
  memberships: z.array(userMembershipSchema),
});

export type ListUsersResponse = z.infer<typeof listUsersResponseSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type ListUserMembershipsResponse = z.infer<
  typeof listUserMembershipsResponseSchema
>;

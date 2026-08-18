import { apiFetch, HttpError } from '@/infrastructure/api/http-client';
import type { ManagedUser } from './domain/user';
import {
  listUsersResponseSchema,
  userResponseSchema,
  type CreateUserInput,
  type ListUsersResponse,
  type UpdateUserInput,
  type UserResponse,
  type UsersErrorCode,
} from './users-api.types';

export class UsersApiError extends Error {
  constructor(
    public readonly code: UsersErrorCode,
    public readonly status?: number,
  ) {
    super(code);
    this.name = 'UsersApiError';
  }
}

async function withUsersApiError<T>(
  fallback: UsersErrorCode,
  statusCodeMap: Partial<Record<number, UsersErrorCode>>,
  action: () => Promise<T>,
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof HttpError) {
      throw new UsersApiError(
        statusCodeMap[error.status] ?? fallback,
        error.status,
      );
    }
    throw new UsersApiError(fallback);
  }
}

export function listUsers(): Promise<ManagedUser[]> {
  return withUsersApiError('loadUsersFailed', {}, async () => {
    const response = await apiFetch<ListUsersResponse>('/users');
    return listUsersResponseSchema.parse(response).users;
  });
}

export function getUser(id: string): Promise<ManagedUser> {
  return withUsersApiError(
    'loadUsersFailed',
    { 404: 'userNotFound' },
    async () => {
      const response = await apiFetch<UserResponse>(`/users/${id}`);
      return userResponseSchema.parse(response).user;
    },
  );
}

export function createUser(input: CreateUserInput): Promise<ManagedUser> {
  return withUsersApiError(
    'createUserFailed',
    { 409: 'emailTaken' },
    async () => {
      const response = await apiFetch<UserResponse>('/users', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return userResponseSchema.parse(response).user;
    },
  );
}

export function updateUser(
  id: string,
  input: UpdateUserInput,
): Promise<ManagedUser> {
  return withUsersApiError(
    'updateUserFailed',
    { 404: 'userNotFound' },
    async () => {
      const response = await apiFetch<UserResponse>(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      });
      return userResponseSchema.parse(response).user;
    },
  );
}

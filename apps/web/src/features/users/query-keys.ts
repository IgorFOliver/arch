import type { ListUsersParams } from './users-api.types';

export const usersKeys = {
  all: () => ['users'] as const,
  lists: () => [...usersKeys.all(), 'list'] as const,
  list: (params: ListUsersParams) => [...usersKeys.lists(), params] as const,
  details: () => [...usersKeys.all(), 'detail'] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
  memberships: (id: string) =>
    [...usersKeys.detail(id), 'memberships'] as const,
};

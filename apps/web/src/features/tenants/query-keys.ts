import type { ListTenantsParams } from './tenants-api.types';

export const tenantsKeys = {
  all: () => ['tenants'] as const,
  lists: () => [...tenantsKeys.all(), 'list'] as const,
  list: (params: ListTenantsParams) =>
    [...tenantsKeys.lists(), params] as const,
  details: () => [...tenantsKeys.all(), 'detail'] as const,
  detail: (id: string) => [...tenantsKeys.details(), id] as const,
};

import { z } from 'zod';
import { tenantSchema, type TenantStatus } from './domain/tenant';

export interface CreateTenantInput {
  name: string;
  slug: string;
}

export interface UpdateTenantInput {
  name?: string;
}

export type TenantsErrorCode =
  | 'loadTenantsFailed'
  | 'tenantNotFound'
  | 'slugTaken'
  | 'createTenantFailed'
  | 'updateTenantFailed'
  | 'statusUpdateFailed';

export type TenantsSortField = 'createdAt' | 'name' | 'slug';
export type SortDirection = 'asc' | 'desc';

export interface ListTenantsParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: TenantStatus;
  sortBy?: TenantsSortField;
  sortDir?: SortDirection;
}

const listTenantsMetaSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export const listTenantsResponseSchema = z.object({
  tenants: z.array(tenantSchema),
  meta: listTenantsMetaSchema,
});

export const tenantResponseSchema = z.object({
  tenant: tenantSchema,
});

export type ListTenantsResponse = z.infer<typeof listTenantsResponseSchema>;
export type TenantResponse = z.infer<typeof tenantResponseSchema>;

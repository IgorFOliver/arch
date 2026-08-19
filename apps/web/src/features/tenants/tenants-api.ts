import { apiFetch, HttpError } from '@/infrastructure/api/http-client';
import type { Tenant } from './domain/tenant';
import {
  listTenantsResponseSchema,
  tenantResponseSchema,
  type CreateTenantInput,
  type ListTenantsParams,
  type ListTenantsResponse,
  type TenantsErrorCode,
  type UpdateTenantInput,
} from './tenants-api.types';

// Consumes the backend's Platform Scope Tenant Management API, mounted at
// /platform/tenants and guarded by PlatformGuard — every call here 403s
// for anyone who isn't a PLATFORM_ADMIN, regardless of Tenant Membership.
const BASE_PATH = '/platform/tenants';

export class TenantsApiError extends Error {
  constructor(
    public readonly code: TenantsErrorCode,
    public readonly status?: number,
  ) {
    super(code);
    this.name = 'TenantsApiError';
  }
}

async function withTenantsApiError<T>(
  fallback: TenantsErrorCode,
  statusCodeMap: Partial<Record<number, TenantsErrorCode>>,
  action: () => Promise<T>,
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof HttpError) {
      throw new TenantsApiError(
        statusCodeMap[error.status] ?? fallback,
        error.status,
      );
    }
    throw new TenantsApiError(fallback);
  }
}

function buildListTenantsQuery(params: ListTenantsParams): string {
  const query = new URLSearchParams();
  query.set('page', String(params.page));
  query.set('pageSize', String(params.pageSize));
  if (params.search) query.set('search', params.search);
  if (params.status) query.set('status', params.status);
  if (params.sortBy) query.set('sortBy', params.sortBy);
  if (params.sortDir) query.set('sortDir', params.sortDir);
  return query.toString();
}

export function listTenants(
  params: ListTenantsParams,
): Promise<ListTenantsResponse> {
  return withTenantsApiError('loadTenantsFailed', {}, async () => {
    const response = await apiFetch<ListTenantsResponse>(
      `${BASE_PATH}?${buildListTenantsQuery(params)}`,
    );
    return listTenantsResponseSchema.parse(response);
  });
}

export function getTenant(id: string): Promise<Tenant> {
  return withTenantsApiError(
    'loadTenantsFailed',
    { 404: 'tenantNotFound' },
    async () => {
      const response = await apiFetch<{ tenant: unknown }>(
        `${BASE_PATH}/${id}`,
      );
      return tenantResponseSchema.parse(response).tenant;
    },
  );
}

export function createTenant(input: CreateTenantInput): Promise<Tenant> {
  return withTenantsApiError(
    'createTenantFailed',
    { 409: 'slugTaken' },
    async () => {
      const response = await apiFetch<{ tenant: unknown }>(BASE_PATH, {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return tenantResponseSchema.parse(response).tenant;
    },
  );
}

export function updateTenant(
  id: string,
  input: UpdateTenantInput,
): Promise<Tenant> {
  return withTenantsApiError(
    'updateTenantFailed',
    { 404: 'tenantNotFound' },
    async () => {
      const response = await apiFetch<{ tenant: unknown }>(
        `${BASE_PATH}/${id}`,
        { method: 'PATCH', body: JSON.stringify(input) },
      );
      return tenantResponseSchema.parse(response).tenant;
    },
  );
}

export function activateTenant(id: string): Promise<Tenant> {
  return withTenantsApiError(
    'statusUpdateFailed',
    { 404: 'tenantNotFound' },
    async () => {
      const response = await apiFetch<{ tenant: unknown }>(
        `${BASE_PATH}/${id}/activate`,
        { method: 'POST' },
      );
      return tenantResponseSchema.parse(response).tenant;
    },
  );
}

export function suspendTenant(id: string): Promise<Tenant> {
  return withTenantsApiError(
    'statusUpdateFailed',
    { 404: 'tenantNotFound' },
    async () => {
      const response = await apiFetch<{ tenant: unknown }>(
        `${BASE_PATH}/${id}/suspend`,
        { method: 'POST' },
      );
      return tenantResponseSchema.parse(response).tenant;
    },
  );
}

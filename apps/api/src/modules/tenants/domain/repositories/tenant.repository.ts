import type { Tenant, TenantStatus } from '../entities/tenant.entity';

export const TENANT_REPOSITORY = Symbol('TENANT_REPOSITORY');

export interface CreateTenantData {
  name: string;
  slug: string;
}

export interface UpdateTenantData {
  name?: string;
}

export type TenantsSortField = 'createdAt' | 'name' | 'slug';

export interface ListTenantsFilter {
  page: number;
  pageSize: number;
  search?: string;
  status?: TenantStatus;
  sortBy: TenantsSortField;
  sortDir: 'asc' | 'desc';
}

export interface TenantRepository {
  findById(id: string): Promise<Tenant | null>;
  findBySlug(slug: string): Promise<Tenant | null>;
  create(data: CreateTenantData): Promise<Tenant>;

  // Platform Scope operations — deliberately not tenant-scoped queries:
  // there is no larger tenant to prove membership within, a Platform
  // Admin operates across all Tenants by design (see PlatformGuard).
  list(
    filter: ListTenantsFilter,
  ): Promise<{ tenants: Tenant[]; total: number }>;
  update(id: string, data: UpdateTenantData): Promise<Tenant>;
  updateStatus(id: string, status: TenantStatus): Promise<Tenant>;
}

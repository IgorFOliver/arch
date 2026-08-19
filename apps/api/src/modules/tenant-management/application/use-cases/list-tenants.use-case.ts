import { Inject, Injectable } from '@nestjs/common';
import {
  TENANT_REPOSITORY,
  type TenantRepository,
} from '../../../tenants/domain/repositories/tenant.repository';
import type { Tenant } from '../../../tenants/domain/entities/tenant.entity';
import type { ListTenantsQueryDto } from '../dto/list-tenants-query.dto';

/**
 * Platform Scope: intentionally not filtered by TenantContext — a
 * Platform Admin must be able to see every Tenant, not just the one they
 * might otherwise be resolved into.
 */
@Injectable()
export class ListTenantsUseCase {
  constructor(
    @Inject(TENANT_REPOSITORY)
    private readonly tenantRepository: TenantRepository,
  ) {}

  async execute(
    query: ListTenantsQueryDto,
  ): Promise<{ tenants: Tenant[]; total: number }> {
    return this.tenantRepository.list({
      page: query.page,
      pageSize: query.pageSize,
      search: query.search,
      status: query.status,
      sortBy: query.sortBy,
      sortDir: query.sortDir,
    });
  }
}

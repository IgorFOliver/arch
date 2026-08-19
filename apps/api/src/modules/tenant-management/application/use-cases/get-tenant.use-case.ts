import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  TENANT_REPOSITORY,
  type TenantRepository,
} from '../../../tenants/domain/repositories/tenant.repository';
import type { Tenant } from '../../../tenants/domain/entities/tenant.entity';

/** Platform Scope: any Tenant, by id — never limited by TenantContext. */
@Injectable()
export class GetTenantUseCase {
  constructor(
    @Inject(TENANT_REPOSITORY)
    private readonly tenantRepository: TenantRepository,
  ) {}

  async execute(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) {
      throw new NotFoundException('Tenant not found.');
    }
    return tenant;
  }
}

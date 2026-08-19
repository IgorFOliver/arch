import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  TENANT_REPOSITORY,
  type TenantRepository,
} from '../../../tenants/domain/repositories/tenant.repository';
import type { Tenant } from '../../../tenants/domain/entities/tenant.entity';
import { AUDIT_PORT, type AuditPort } from '../../../audit/domain/audit.port';
import type { UpdateTenantDto } from '../dto/update-tenant.dto';

@Injectable()
export class UpdateTenantUseCase {
  constructor(
    @Inject(TENANT_REPOSITORY)
    private readonly tenantRepository: TenantRepository,
    @Inject(AUDIT_PORT) private readonly auditPort: AuditPort,
  ) {}

  async execute(
    actorUserId: string,
    id: string,
    dto: UpdateTenantDto,
  ): Promise<Tenant> {
    const existing = await this.tenantRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Tenant not found.');
    }

    const tenant = await this.tenantRepository.update(id, {
      name: dto.name,
    });

    await this.auditPort.record({
      tenantId: tenant.id,
      actorUserId,
      action: 'TENANT_UPDATED',
      resourceType: 'Tenant',
      resourceId: tenant.id,
      metadata: { name: dto.name },
    });

    return tenant;
  }
}

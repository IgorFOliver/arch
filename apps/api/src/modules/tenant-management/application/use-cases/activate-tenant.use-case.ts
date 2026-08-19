import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  TENANT_REPOSITORY,
  type TenantRepository,
} from '../../../tenants/domain/repositories/tenant.repository';
import type { Tenant } from '../../../tenants/domain/entities/tenant.entity';
import { AUDIT_PORT, type AuditPort } from '../../../audit/domain/audit.port';

/** Explicit lifecycle operation — not a generic status field on PATCH. */
@Injectable()
export class ActivateTenantUseCase {
  constructor(
    @Inject(TENANT_REPOSITORY)
    private readonly tenantRepository: TenantRepository,
    @Inject(AUDIT_PORT) private readonly auditPort: AuditPort,
  ) {}

  async execute(actorUserId: string, id: string): Promise<Tenant> {
    const existing = await this.tenantRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Tenant not found.');
    }

    const tenant = await this.tenantRepository.updateStatus(id, 'ACTIVE');

    await this.auditPort.record({
      tenantId: tenant.id,
      actorUserId,
      action: 'TENANT_ACTIVATED',
      resourceType: 'Tenant',
      resourceId: tenant.id,
    });

    return tenant;
  }
}

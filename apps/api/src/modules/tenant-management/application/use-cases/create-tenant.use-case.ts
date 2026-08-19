import { ConflictException, Inject, Injectable } from '@nestjs/common';
import {
  TENANT_REPOSITORY,
  type TenantRepository,
} from '../../../tenants/domain/repositories/tenant.repository';
import type { Tenant } from '../../../tenants/domain/entities/tenant.entity';
import { AUDIT_PORT, type AuditPort } from '../../../audit/domain/audit.port';
import type { CreateTenantDto } from '../dto/create-tenant.dto';

/**
 * Platform Scope tenant creation — distinct from
 * modules/tenants/application/use-cases/create-tenant.use-case.ts (the
 * self-serve flow, which also creates an ADMIN Membership for the
 * creator). Here the Tenant is created on its own: no Membership, no
 * user needs to belong to it yet.
 */
@Injectable()
export class CreateTenantUseCase {
  constructor(
    @Inject(TENANT_REPOSITORY)
    private readonly tenantRepository: TenantRepository,
    @Inject(AUDIT_PORT) private readonly auditPort: AuditPort,
  ) {}

  async execute(actorUserId: string, dto: CreateTenantDto): Promise<Tenant> {
    const existing = await this.tenantRepository.findBySlug(dto.slug);
    if (existing) {
      throw new ConflictException('A tenant with this slug already exists.');
    }

    const tenant = await this.tenantRepository.create({
      name: dto.name,
      slug: dto.slug,
    });

    await this.auditPort.record({
      tenantId: tenant.id,
      actorUserId,
      action: 'TENANT_CREATED',
      resourceType: 'Tenant',
      resourceId: tenant.id,
    });

    return tenant;
  }
}

import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { Role } from '@4basearch/domain-types';
import {
  TENANT_REPOSITORY,
  type TenantRepository,
} from '../../domain/repositories/tenant.repository';
import {
  MEMBERSHIP_REPOSITORY,
  type MembershipRepository,
} from '../../domain/repositories/membership.repository';
import type { Tenant } from '../../domain/entities/tenant.entity';
import type { Membership } from '../../domain/entities/membership.entity';
import { AUDIT_PORT, type AuditPort } from '../../../audit/domain/audit.port';

export interface CreateTenantInput {
  name: string;
  slug: string;
  creatorUserId: string;
}

export interface CreateTenantResult {
  tenant: Tenant;
  membership: Membership;
}

@Injectable()
export class CreateTenantUseCase {
  constructor(
    @Inject(TENANT_REPOSITORY)
    private readonly tenantRepository: TenantRepository,
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: MembershipRepository,
    @Inject(AUDIT_PORT) private readonly auditPort: AuditPort,
  ) {}

  async execute(input: CreateTenantInput): Promise<CreateTenantResult> {
    const existing = await this.tenantRepository.findBySlug(input.slug);
    if (existing) {
      throw new ConflictException('A tenant with this slug already exists.');
    }

    const tenant = await this.tenantRepository.create({
      name: input.name,
      slug: input.slug,
    });

    // The creator becomes the tenant's first admin — there is no prior
    // membership to authorize this against, so tenant creation is itself
    // the trusted bootstrap point.
    const membership = await this.membershipRepository.create({
      userId: input.creatorUserId,
      tenantId: tenant.id,
      role: Role.ADMIN,
    });

    await this.auditPort.record({
      tenantId: tenant.id,
      actorUserId: input.creatorUserId,
      action: 'TENANT_CREATED',
      resourceType: 'Tenant',
      resourceId: tenant.id,
    });

    return { tenant, membership };
  }
}

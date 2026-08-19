import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  SESSION_REPOSITORY,
  type SessionRepository,
} from '../../domain/repositories/session.repository';
import {
  TENANT_REPOSITORY,
  type TenantRepository,
} from '../../../tenants/domain/repositories/tenant.repository';
import {
  MEMBERSHIP_REPOSITORY,
  type MembershipRepository,
} from '../../../tenants/domain/repositories/membership.repository';
import { isMembershipActive } from '../../../tenants/domain/membership-status';
import type { Tenant } from '../../../tenants/domain/entities/tenant.entity';
import type { Membership } from '../../../tenants/domain/entities/membership.entity';

export interface SwitchActiveTenantInput {
  userId: string;
  sessionToken: string;
  tenantId: string;
}

export interface SwitchedTenant {
  tenant: Tenant;
  membership: Membership;
}

/**
 * The only way `Session.activeTenantId` ever changes. Never trusts the
 * requested tenantId at face value — existence, status, and Membership
 * are all re-verified server-side before the session is touched, exactly
 * mirroring the same three checks TenantGuard runs on every subsequent
 * request (see ResolveTenantContextUseCase). A caller who fails any of
 * them gets 404/403 and the session is left exactly as it was.
 */
@Injectable()
export class SwitchActiveTenantUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,
    @Inject(TENANT_REPOSITORY)
    private readonly tenantRepository: TenantRepository,
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: MembershipRepository,
  ) {}

  async execute(input: SwitchActiveTenantInput): Promise<SwitchedTenant> {
    const tenant = await this.tenantRepository.findById(input.tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found.');
    }
    if (tenant.status !== 'ACTIVE') {
      throw new ForbiddenException('This tenant is not accessible.');
    }

    const membership = await this.membershipRepository.findByUserAndTenant(
      input.userId,
      input.tenantId,
    );
    if (!membership || !isMembershipActive(membership)) {
      throw new ForbiddenException('You do not have access to this tenant.');
    }

    await this.sessionRepository.setActiveTenant(
      input.sessionToken,
      input.tenantId,
    );

    return { tenant, membership };
  }
}

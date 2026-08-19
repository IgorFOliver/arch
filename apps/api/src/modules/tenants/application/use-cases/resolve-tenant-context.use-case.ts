import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import {
  TENANT_RESOLVER,
  type RequestContext,
  type TenantResolver,
} from '../../domain/ports/tenant-resolver';
import {
  TENANT_REPOSITORY,
  type TenantRepository,
} from '../../domain/repositories/tenant.repository';
import {
  MEMBERSHIP_REPOSITORY,
  type MembershipRepository,
} from '../../domain/repositories/membership.repository';
import { isMembershipActive } from '../../domain/membership-status';
import type { TenantContext } from '../../domain/tenant-context';
import type { Membership } from '../../domain/entities/membership.entity';

export interface ResolvedTenant {
  tenantContext: TenantContext;
  membership: Membership;
}

@Injectable()
export class ResolveTenantContextUseCase {
  constructor(
    @Inject(TENANT_RESOLVER) private readonly tenantResolver: TenantResolver,
    @Inject(TENANT_REPOSITORY)
    private readonly tenantRepository: TenantRepository,
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: MembershipRepository,
  ) {}

  async execute(context: RequestContext): Promise<ResolvedTenant> {
    // Step 1 — Tenant Resolution: "which tenant is this request for?"
    const tenantId = await this.tenantResolver.resolve(context);
    if (!tenantId) {
      throw new ForbiddenException(
        'No active tenant could be resolved for this user.',
      );
    }

    // Step 2 — Tenant Validity: a suspended Tenant is not accessible to
    // anyone through the normal tenant-scoped flow, regardless of how
    // long ago their Membership was granted — Platform Admin's suspend
    // action must take effect immediately, on the next request.
    const tenant = await this.tenantRepository.findById(tenantId);
    if (!tenant || tenant.status !== 'ACTIVE') {
      throw new ForbiddenException('This tenant is not accessible.');
    }

    // Step 3 — Membership Validation: "can this user act in that tenant?"
    // Resolution alone never authorizes anything — a resolved tenant with
    // no (or a revoked) membership still fails closed here.
    const membership = await this.membershipRepository.findByUserAndTenant(
      context.userId,
      tenantId,
    );
    if (!membership || !isMembershipActive(membership)) {
      throw new ForbiddenException('No active membership for this tenant.');
    }

    return {
      tenantContext: { tenantId, userId: context.userId },
      membership,
    };
  }
}

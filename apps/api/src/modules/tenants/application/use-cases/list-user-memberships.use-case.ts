import { Inject, Injectable } from '@nestjs/common';
import {
  MEMBERSHIP_REPOSITORY,
  type MembershipRepository,
} from '../../domain/repositories/membership.repository';
import {
  TENANT_REPOSITORY,
  type TenantRepository,
} from '../../domain/repositories/tenant.repository';
import {
  toMembershipWithTenant,
  type MembershipWithTenant,
} from '../membership-with-tenant';

/**
 * Platform Scope: every Membership a User holds, any status, across every
 * Tenant — the Edit User screen's "tenants this person belongs to" list.
 */
@Injectable()
export class ListUserMembershipsUseCase {
  constructor(
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: MembershipRepository,
    @Inject(TENANT_REPOSITORY)
    private readonly tenantRepository: TenantRepository,
  ) {}

  async execute(userId: string): Promise<MembershipWithTenant[]> {
    const memberships = await this.membershipRepository.findAllByUserId(userId);
    const tenants = await Promise.all(
      memberships.map((membership) =>
        this.tenantRepository.findById(membership.tenantId),
      ),
    );

    return memberships.reduce<MembershipWithTenant[]>(
      (views, membership, index) => {
        const tenant = tenants[index];
        if (tenant) {
          views.push(toMembershipWithTenant(membership, tenant));
        }
        return views;
      },
      [],
    );
  }
}

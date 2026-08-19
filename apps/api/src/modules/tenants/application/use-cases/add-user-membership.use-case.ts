import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Role } from '@4basearch/domain-types';
import {
  MEMBERSHIP_REPOSITORY,
  type MembershipRepository,
} from '../../domain/repositories/membership.repository';
import {
  TENANT_REPOSITORY,
  type TenantRepository,
} from '../../domain/repositories/tenant.repository';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../../users/domain/repositories/user.repository';
import type { Membership } from '../../domain/entities/membership.entity';
import { AUDIT_PORT, type AuditPort } from '../../../audit/domain/audit.port';

/**
 * Platform Scope: links an existing User to an existing Tenant with a
 * role — the Edit User screen's "add membership" action. No acting
 * TenantContext involved, the target tenant is whatever the Platform
 * Admin picked.
 */
@Injectable()
export class AddUserMembershipUseCase {
  constructor(
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: MembershipRepository,
    @Inject(TENANT_REPOSITORY)
    private readonly tenantRepository: TenantRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(AUDIT_PORT) private readonly auditPort: AuditPort,
  ) {}

  async execute(
    actorUserId: string,
    targetUserId: string,
    tenantId: string,
    role: Role,
  ): Promise<Membership> {
    const user = await this.userRepository.findById(targetUserId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const tenant = await this.tenantRepository.findById(tenantId);
    if (!tenant || tenant.status !== 'ACTIVE') {
      throw new NotFoundException('Tenant not found.');
    }

    const existing = await this.membershipRepository.findByUserAndTenant(
      targetUserId,
      tenantId,
    );

    let membership: Membership;
    if (existing?.status === 'ACTIVE') {
      throw new ConflictException(
        'This user already has an active membership for this tenant.',
      );
    } else if (existing) {
      membership = await this.membershipRepository.reactivate(
        tenantId,
        existing.id,
        role,
      );
    } else {
      membership = await this.membershipRepository.create({
        userId: targetUserId,
        tenantId,
        role,
      });
    }

    await this.auditPort.record({
      tenantId,
      actorUserId,
      action: 'MEMBERSHIP_CREATED',
      resourceType: 'Membership',
      resourceId: membership.id,
      metadata: { targetUserId, role },
    });

    return membership;
  }
}

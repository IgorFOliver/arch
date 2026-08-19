import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  MEMBERSHIP_REPOSITORY,
  type MembershipRepository,
} from '../../domain/repositories/membership.repository';
import { AUDIT_PORT, type AuditPort } from '../../../audit/domain/audit.port';

/**
 * Platform Scope: permanently undoes a User<->Tenant link — the Edit User
 * screen's "remove membership" action. Unlike RevokeMembershipUseCase
 * (a tenant admin blocking one of their own members, kept for history),
 * this is a hard delete: for correcting a membership that shouldn't
 * exist at all.
 */
@Injectable()
export class DeleteUserMembershipUseCase {
  constructor(
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: MembershipRepository,
    @Inject(AUDIT_PORT) private readonly auditPort: AuditPort,
  ) {}

  async execute(actorUserId: string, membershipId: string): Promise<void> {
    const membership =
      await this.membershipRepository.findByIdUnscoped(membershipId);
    if (!membership) {
      throw new NotFoundException('Membership not found.');
    }

    await this.membershipRepository.deleteById(membershipId);

    await this.auditPort.record({
      tenantId: membership.tenantId,
      actorUserId,
      action: 'MEMBERSHIP_DELETED',
      resourceType: 'Membership',
      resourceId: membership.id,
      metadata: { userId: membership.userId, role: membership.role },
    });
  }
}

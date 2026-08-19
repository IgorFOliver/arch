import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MEMBERSHIP_REPOSITORY,
  type MembershipRepository,
} from '../../domain/repositories/membership.repository';
import type { Membership } from '../../domain/entities/membership.entity';
import { PermissionsService } from '../../../authorization/application/permissions.service';
import { AUDIT_PORT, type AuditPort } from '../../../audit/domain/audit.port';

export interface RevokeMembershipInput {
  actingMembership: Membership;
  membershipId: string;
}

@Injectable()
export class RevokeMembershipUseCase {
  constructor(
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: MembershipRepository,
    private readonly permissionsService: PermissionsService,
    @Inject(AUDIT_PORT) private readonly auditPort: AuditPort,
  ) {}

  async execute(input: RevokeMembershipInput): Promise<Membership> {
    if (
      !this.permissionsService.can(input.actingMembership, 'memberships.revoke')
    ) {
      throw new ForbiddenException(
        'You do not have permission to revoke members of this tenant.',
      );
    }

    const target = await this.membershipRepository.findById(
      input.actingMembership.tenantId,
      input.membershipId,
    );
    if (!target) {
      throw new NotFoundException('Membership not found.');
    }

    const membership = await this.membershipRepository.revoke(
      input.actingMembership.tenantId,
      target.id,
    );

    await this.auditPort.record({
      tenantId: input.actingMembership.tenantId,
      actorUserId: input.actingMembership.userId,
      action: 'MEMBERSHIP_REVOKED',
      resourceType: 'Membership',
      resourceId: membership.id,
    });

    return membership;
  }
}

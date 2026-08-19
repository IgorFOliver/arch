import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Role } from '@4basearch/domain-types';
import {
  MEMBERSHIP_REPOSITORY,
  type MembershipRepository,
} from '../../domain/repositories/membership.repository';
import { isMembershipActive } from '../../domain/membership-status';
import type { Membership } from '../../domain/entities/membership.entity';
import type { TenantContext } from '../../domain/tenant-context';
import { PermissionsService } from '../../../authorization/application/permissions.service';
import { AUDIT_PORT, type AuditPort } from '../../../audit/domain/audit.port';

export interface UpdateMembershipInput {
  actingContext: TenantContext;
  membershipId: string;
  role: Role;
}

@Injectable()
export class UpdateMembershipUseCase {
  constructor(
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: MembershipRepository,
    private readonly permissionsService: PermissionsService,
    @Inject(AUDIT_PORT) private readonly auditPort: AuditPort,
  ) {}

  async execute(input: UpdateMembershipInput): Promise<Membership> {
    if (
      !this.permissionsService.can(input.actingContext, 'memberships.update')
    ) {
      throw new ForbiddenException(
        'You do not have permission to update members of this tenant.',
      );
    }

    const tenantId = input.actingContext.tenantId;
    const target = await this.membershipRepository.findById(
      tenantId,
      input.membershipId,
    );
    if (!target) {
      throw new NotFoundException('Membership not found.');
    }

    // A revoked membership can only be reactivated — role changes are
    // denied while it's revoked, otherwise a blocked member's authority
    // could still be edited out from under them (same rule as
    // UpdateUserUseCase applies to profile/role edits).
    if (!isMembershipActive(target)) {
      throw new ForbiddenException(
        'This membership is revoked; reactivate it before changing its role.',
      );
    }

    const membership = await this.membershipRepository.updateRole(
      tenantId,
      target.id,
      input.role,
    );

    await this.auditPort.record({
      tenantId,
      actorUserId: input.actingContext.userId,
      action: 'ROLE_CHANGED',
      resourceType: 'Membership',
      resourceId: membership.id,
      metadata: { role: input.role },
    });

    return membership;
  }
}

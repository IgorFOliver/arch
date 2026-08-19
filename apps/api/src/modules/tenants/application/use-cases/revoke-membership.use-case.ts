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
import type { TenantContext } from '../../domain/tenant-context';
import { PermissionsService } from '../../../authorization/application/permissions.service';
import { AUDIT_PORT, type AuditPort } from '../../../audit/domain/audit.port';

export interface RevokeMembershipInput {
  actingContext: TenantContext;
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
      !this.permissionsService.can(input.actingContext, 'memberships.revoke')
    ) {
      throw new ForbiddenException(
        'You do not have permission to revoke members of this tenant.',
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

    const membership = await this.membershipRepository.revoke(
      tenantId,
      target.id,
    );

    await this.auditPort.record({
      tenantId,
      actorUserId: input.actingContext.userId,
      action: 'MEMBERSHIP_REVOKED',
      resourceType: 'Membership',
      resourceId: membership.id,
    });

    return membership;
  }
}

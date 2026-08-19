import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import type { Role } from '@4basearch/domain-types';
import {
  MEMBERSHIP_REPOSITORY,
  type MembershipRepository,
} from '../../domain/repositories/membership.repository';
import type { Membership } from '../../domain/entities/membership.entity';
import { PermissionsService } from '../../../authorization/application/permissions.service';
import { AUDIT_PORT, type AuditPort } from '../../../audit/domain/audit.port';

export interface CreateMembershipInput {
  actingMembership: Membership;
  targetUserId: string;
  role: Role;
}

@Injectable()
export class CreateMembershipUseCase {
  constructor(
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: MembershipRepository,
    private readonly permissionsService: PermissionsService,
    @Inject(AUDIT_PORT) private readonly auditPort: AuditPort,
  ) {}

  async execute(input: CreateMembershipInput): Promise<Membership> {
    if (
      !this.permissionsService.can(input.actingMembership, 'memberships.create')
    ) {
      throw new ForbiddenException(
        'You do not have permission to add members to this tenant.',
      );
    }

    // The tenant a membership gets created in is ALWAYS the acting
    // membership's own tenant — never a caller-supplied value. A separate
    // `tenantId` field here would let an admin of tenant B pass tenant A's
    // id and create a membership somewhere they have no authority over.
    const tenantId = input.actingMembership.tenantId;

    const existing = await this.membershipRepository.findByUserAndTenant(
      input.targetUserId,
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
        input.role,
      );
    } else {
      membership = await this.membershipRepository.create({
        userId: input.targetUserId,
        tenantId,
        role: input.role,
      });
    }

    await this.auditPort.record({
      tenantId,
      actorUserId: input.actingMembership.userId,
      action: 'MEMBERSHIP_CREATED',
      resourceType: 'Membership',
      resourceId: membership.id,
      metadata: { targetUserId: input.targetUserId, role: input.role },
    });

    return membership;
  }
}

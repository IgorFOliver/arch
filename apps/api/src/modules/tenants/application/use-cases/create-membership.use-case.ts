import {
  ConflictException,
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
import type { Membership } from '../../domain/entities/membership.entity';
import type { TenantContext } from '../../domain/tenant-context';
import { PermissionsService } from '../../../authorization/application/permissions.service';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../../users/domain/repositories/user.repository';
import { AUDIT_PORT, type AuditPort } from '../../../audit/domain/audit.port';

export interface CreateMembershipInput {
  actingContext: TenantContext;
  email: string;
  role: Role;
}

/**
 * Associates an EXISTING User (found by email) with the acting admin's
 * tenant — never creates a new User. Creating a brand-new identity is
 * UsersController's job; this is purely "invite someone who already has
 * an account elsewhere on the platform into my tenant".
 */
@Injectable()
export class CreateMembershipUseCase {
  constructor(
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: MembershipRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly permissionsService: PermissionsService,
    @Inject(AUDIT_PORT) private readonly auditPort: AuditPort,
  ) {}

  async execute(input: CreateMembershipInput): Promise<Membership> {
    if (
      !this.permissionsService.can(input.actingContext, 'memberships.create')
    ) {
      throw new ForbiddenException(
        'You do not have permission to add members to this tenant.',
      );
    }

    const targetUser = await this.userRepository.findByEmail(input.email);
    if (!targetUser) {
      throw new NotFoundException('No user found with this email.');
    }

    // The tenant a membership gets created in is ALWAYS the acting
    // context's own tenant — never a caller-supplied value. A separate
    // `tenantId` field here would let an admin of tenant B pass tenant A's
    // id and create a membership somewhere they have no authority over.
    const tenantId = input.actingContext.tenantId;

    const existing = await this.membershipRepository.findByUserAndTenant(
      targetUser.id,
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
        userId: targetUser.id,
        tenantId,
        role: input.role,
      });
    }

    await this.auditPort.record({
      tenantId,
      actorUserId: input.actingContext.userId,
      action: 'MEMBERSHIP_CREATED',
      resourceType: 'Membership',
      resourceId: membership.id,
      metadata: { targetUserId: targetUser.id, role: input.role },
    });

    return membership;
  }
}

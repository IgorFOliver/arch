import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  USER_REPOSITORY,
  type TenantScopedUser,
  type UserRepository,
} from '../../domain/repositories/user.repository';
import {
  MEMBERSHIP_REPOSITORY,
  type MembershipRepository,
} from '../../../tenants/domain/repositories/membership.repository';
import { isMembershipActive } from '../../../tenants/domain/membership-status';
import type { Membership } from '../../../tenants/domain/entities/membership.entity';
import { AUDIT_PORT, type AuditPort } from '../../../audit/domain/audit.port';
import type { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: MembershipRepository,
    @Inject(AUDIT_PORT) private readonly auditPort: AuditPort,
  ) {}

  async execute(
    actingMembership: Membership,
    targetUserId: string,
    dto: UpdateUserDto,
  ): Promise<TenantScopedUser> {
    const tenantId = actingMembership.tenantId;

    // Membership existence (any status) is what "belongs to this tenant"
    // means — a target user with no Membership row here gets the exact
    // same NotFoundException as a truly nonexistent id, never revealing
    // whether they exist in some other tenant.
    const membership = await this.membershipRepository.findByUserAndTenant(
      targetUserId,
      tenantId,
    );
    if (!membership) {
      throw new NotFoundException('User not found.');
    }

    // A revoked membership can only be reactivated — every other mutation
    // (profile fields, role) is denied while it's revoked, otherwise a
    // blocked user's data/role could still be edited out from under them.
    if (!isMembershipActive(membership) && dto.active !== true) {
      throw new ForbiddenException(
        'This membership is revoked; reactivate it before making other changes.',
      );
    }

    if (dto.name !== undefined || dto.company !== undefined) {
      await this.userRepository.updateMember(tenantId, targetUserId, {
        name: dto.name,
        company: dto.company,
      });
    }

    if (dto.active === true) {
      const role = dto.role ?? membership.role;
      await this.membershipRepository.reactivate(tenantId, membership.id, role);
      await this.auditPort.record({
        tenantId,
        actorUserId: actingMembership.userId,
        action: 'MEMBERSHIP_REACTIVATED',
        resourceType: 'Membership',
        resourceId: membership.id,
      });
    } else if (dto.active === false) {
      await this.membershipRepository.revoke(tenantId, membership.id);
      await this.auditPort.record({
        tenantId,
        actorUserId: actingMembership.userId,
        action: 'MEMBERSHIP_REVOKED',
        resourceType: 'Membership',
        resourceId: membership.id,
      });
    } else if (dto.role !== undefined) {
      await this.membershipRepository.updateRole(
        tenantId,
        membership.id,
        dto.role,
      );
      await this.auditPort.record({
        tenantId,
        actorUserId: actingMembership.userId,
        action: 'ROLE_CHANGED',
        resourceType: 'Membership',
        resourceId: membership.id,
        metadata: { role: dto.role },
      });
    }

    const updated = await this.userRepository.findMemberById(
      tenantId,
      targetUserId,
    );
    if (!updated) {
      throw new NotFoundException('User not found.');
    }
    return updated;
  }
}

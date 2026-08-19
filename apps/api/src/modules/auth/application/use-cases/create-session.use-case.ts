import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import {
  SESSION_REPOSITORY,
  type CreatedSession,
  type SessionRepository,
} from '../../domain/repositories/session.repository';
import {
  MEMBERSHIP_REPOSITORY,
  type MembershipRepository,
} from '../../../tenants/domain/repositories/membership.repository';
import { resolveDefaultTenantId } from '../../../tenants/domain/resolve-default-tenant';
import type { User } from '../../../users/domain/entities/user.entity';

@Injectable()
export class CreateSessionUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: MembershipRepository,
  ) {}

  async execute(user: User): Promise<CreatedSession> {
    if (!user.active) {
      throw new ForbiddenException('Your account has been blocked.');
    }

    // Best-effort convenience only — if this doesn't land on a tenant
    // (zero or several Memberships), the session simply starts with no
    // Current Tenant; nothing here is a source of authorization, so
    // getting it "wrong" is never a security concern, only a UX one.
    const memberships = await this.membershipRepository.findActiveByUserId(
      user.id,
    );
    const activeTenantId = resolveDefaultTenantId(memberships);

    return this.sessionRepository.create(user.id, activeTenantId);
  }
}

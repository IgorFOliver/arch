import { ConflictException, Inject, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { Role } from '@4basearch/domain-types';
import {
  USER_REPOSITORY,
  type TenantScopedUser,
  type UserRepository,
} from '../../domain/repositories/user.repository';
import {
  MEMBERSHIP_REPOSITORY,
  type MembershipRepository,
} from '../../../tenants/domain/repositories/membership.repository';
import type { Membership } from '../../../tenants/domain/entities/membership.entity';
import { AUDIT_PORT, type AuditPort } from '../../../audit/domain/audit.port';
import type { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: MembershipRepository,
    @Inject(AUDIT_PORT) private readonly auditPort: AuditPort,
  ) {}

  async execute(
    actingMembership: Membership,
    dto: CreateUserDto,
  ): Promise<TenantScopedUser> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('A user with this email already exists.');
    }

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.userRepository.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      company: dto.company,
    });

    const role = dto.role ?? Role.USER;
    const membership = await this.membershipRepository.create({
      userId: user.id,
      tenantId: actingMembership.tenantId,
      role,
    });

    await this.auditPort.record({
      tenantId: actingMembership.tenantId,
      actorUserId: actingMembership.userId,
      action: 'USER_CREATED',
      resourceType: 'User',
      resourceId: user.id,
      metadata: { role },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      company: user.company,
      role: membership.role,
      active: membership.status === 'ACTIVE',
      createdAt: user.createdAt,
    };
  }
}

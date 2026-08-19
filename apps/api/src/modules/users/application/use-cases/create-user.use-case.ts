import { ConflictException, Inject, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/repositories/user.repository';
import type { User } from '../../domain/entities/user.entity';
import { AUDIT_PORT, type AuditPort } from '../../../audit/domain/audit.port';
import type { CreateUserDto } from '../dto/create-user.dto';

/**
 * Platform Scope: creates a brand-new platform identity, with no
 * Membership anywhere. Attaching that identity to a tenant is a separate
 * concern — see CreateMembershipUseCase.
 */
@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(AUDIT_PORT) private readonly auditPort: AuditPort,
  ) {}

  async execute(actorUserId: string, dto: CreateUserDto): Promise<User> {
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

    await this.auditPort.record({
      actorUserId,
      action: 'USER_CREATED',
      resourceType: 'User',
      resourceId: user.id,
    });

    return user;
  }
}

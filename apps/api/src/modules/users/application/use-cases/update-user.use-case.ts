import { Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/repositories/user.repository';
import type { User } from '../../domain/entities/user.entity';
import { AUDIT_PORT, type AuditPort } from '../../../audit/domain/audit.port';
import type { UpdateUserDto } from '../dto/update-user.dto';

/** Platform Scope: edits a platform identity's own fields — never a Membership. */
@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(AUDIT_PORT) private readonly auditPort: AuditPort,
  ) {}

  async execute(
    actorUserId: string,
    targetUserId: string,
    dto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.userRepository.update(targetUserId, {
      name: dto.name,
      company: dto.company,
      active: dto.active,
    });

    await this.auditPort.record({
      actorUserId,
      action: dto.active === false ? 'USER_BLOCKED' : 'USER_UPDATED',
      resourceType: 'User',
      resourceId: user.id,
    });

    return user;
  }
}

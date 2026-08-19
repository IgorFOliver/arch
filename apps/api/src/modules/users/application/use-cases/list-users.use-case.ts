import { Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/repositories/user.repository';
import type { User } from '../../domain/entities/user.entity';
import type { ListUsersQueryDto } from '../dto/list-users-query.dto';

/**
 * Platform Scope: intentionally not filtered by TenantContext — a
 * Platform Admin must be able to see every User on the platform, not
 * just the members of one tenant.
 */
@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  execute(query: ListUsersQueryDto): Promise<{ users: User[]; total: number }> {
    return this.userRepository.findAll(query);
  }
}

import { Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type TenantScopedUser,
  type UserRepository,
} from '../../domain/repositories/user.repository';
import type { ListUsersQueryDto } from '../dto/list-users-query.dto';

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  execute(
    tenantId: string,
    query: ListUsersQueryDto,
  ): Promise<{ users: TenantScopedUser[]; total: number }> {
    return this.userRepository.findMembers({ tenantId, ...query });
  }
}

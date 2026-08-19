import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type TenantScopedUser,
  type UserRepository,
} from '../../domain/repositories/user.repository';

@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async execute(tenantId: string, id: string): Promise<TenantScopedUser> {
    const user = await this.userRepository.findMemberById(tenantId, id);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return user;
  }
}

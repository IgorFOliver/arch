import { Inject, Injectable } from '@nestjs/common';
import {
  SESSION_REPOSITORY,
  type SessionRepository,
} from '../../domain/repositories/session.repository';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../../users/domain/repositories/user.repository';
import type { User } from '../../../users/domain/entities/user.entity';

@Injectable()
export class ValidateSessionUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async execute(token: string): Promise<User | null> {
    const userId = await this.sessionRepository.findUserIdByToken(token);
    if (!userId) {
      return null;
    }
    return this.userRepository.findById(userId);
  }
}

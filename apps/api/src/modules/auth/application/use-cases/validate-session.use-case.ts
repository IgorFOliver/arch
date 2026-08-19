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

export interface ValidatedSession {
  user: User;
  activeTenantId: string | null;
}

@Injectable()
export class ValidateSessionUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async execute(token: string): Promise<ValidatedSession | null> {
    const session = await this.sessionRepository.findByToken(token);
    if (!session) {
      return null;
    }
    const user = await this.userRepository.findById(session.userId);
    if (!user) {
      return null;
    }
    return { user, activeTenantId: session.activeTenantId };
  }
}

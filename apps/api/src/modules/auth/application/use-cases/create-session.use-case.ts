import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import {
  SESSION_REPOSITORY,
  type CreatedSession,
  type SessionRepository,
} from '../../domain/repositories/session.repository';
import type { User } from '../../../users/domain/entities/user.entity';

@Injectable()
export class CreateSessionUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,
  ) {}

  async execute(user: User): Promise<CreatedSession> {
    if (!user.active) {
      throw new ForbiddenException('Your account has been blocked.');
    }

    return this.sessionRepository.create(user.id);
  }
}

import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../../users/domain/repositories/user.repository';
import type { User } from '../../../users/domain/entities/user.entity';
import type { CreatedSession } from '../../domain/repositories/session.repository';
import { CreateSessionUseCase } from './create-session.use-case';
import type { LoginDto } from '../dto/login.dto';

export interface LoginResult {
  user: User;
  session: CreatedSession;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly createSessionUseCase: CreateSessionUseCase,
  ) {}

  async execute(dto: LoginDto): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (
      !user?.passwordHash ||
      !(await argon2.verify(user.passwordHash, dto.password))
    ) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const session = await this.createSessionUseCase.execute(user);
    return { user, session };
  }
}

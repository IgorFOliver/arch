import { ConflictException, Inject, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../../users/domain/repositories/user.repository';
import type { User } from '../../../users/domain/entities/user.entity';
import type { CreatedSession } from '../../domain/repositories/session.repository';
import { CreateSessionUseCase } from './create-session.use-case';
import type { SignupDto } from '../dto/signup.dto';

export interface SignupResult {
  user: User;
  session: CreatedSession;
}

@Injectable()
export class SignupUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly createSessionUseCase: CreateSessionUseCase,
  ) {}

  async execute(dto: SignupDto): Promise<SignupResult> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.userRepository.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      company: dto.company,
    });

    const session = await this.createSessionUseCase.execute(user);
    return { user, session };
  }
}

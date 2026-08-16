import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { User } from '@prisma/client';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { SessionService } from './session.service';

export interface PublicUser {
  id: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly sessionService: SessionService,
  ) {}

  async validateLocal(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);

    if (
      !user?.passwordHash ||
      !(await argon2.verify(user.passwordHash, password))
    ) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return user;
  }

  async createSession(res: Response, user: User): Promise<void> {
    const session = await this.sessionService.create(user.id);
    this.sessionService.setCookie(res, session.id);
  }

  toPublicUser(user: User): PublicUser {
    return { id: user.id, email: user.email, role: user.role };
  }
}

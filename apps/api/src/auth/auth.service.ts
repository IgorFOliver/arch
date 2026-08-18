import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { User } from '@prisma/client';
import { Response } from 'express';
import { PublicUser, UsersService } from '../users/users.service';
import { SessionService } from './session.service';
import { SignupDto } from './dto/signup.dto';

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

  async signup(dto: SignupDto): Promise<User> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }

    const passwordHash = await argon2.hash(dto.password);
    return this.usersService.createLocalUser(
      dto.email,
      passwordHash,
      dto.name,
      dto.company,
    );
  }

  async createSession(res: Response, user: User): Promise<void> {
    if (!user.active) {
      throw new ForbiddenException('Your account has been blocked.');
    }

    const session = await this.sessionService.create(user.id);
    this.sessionService.setCookie(res, session.id);
  }

  toPublicUser(user: User): PublicUser {
    return this.usersService.toPublicUser(user);
  }
}
